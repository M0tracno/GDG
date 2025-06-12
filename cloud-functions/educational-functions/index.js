// Google Cloud Function for processing assignment submissions
// This function handles file uploads, content analysis, and notifications

const { Storage } = require('@google-cloud/storage');
const { PubSub } = require('@google-cloud/pubsub');
const { LanguageServiceClient } = require('@google-cloud/language');
const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
const functions = require('@google-cloud/functions-framework');

// Initialize Google Cloud clients
const storage = new Storage();
const pubsub = new PubSub();
const language = new LanguageServiceClient();
const textToSpeech = new TextToSpeechClient();

// Assignment Processing Function
functions.http('processAssignment', async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const { 
      studentId, 
      assignmentId, 
      courseId, 
      fileName, 
      bucketName,
      analysisType = 'full'
    } = req.body;

    console.log(`Processing assignment for student ${studentId}, assignment ${assignmentId}`);

    // Download file from Cloud Storage
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(fileName);
    
    const [fileContents] = await file.download();
    const textContent = fileContents.toString();

    let analysisResult = {};

    // Perform text analysis if requested
    if (analysisType === 'full' || analysisType === 'text') {
      analysisResult.textAnalysis = await analyzeText(textContent);
    }

    // Generate feedback audio if requested
    if (analysisType === 'full' || analysisType === 'audio') {
      analysisResult.audioFeedback = await generateAudioFeedback(
        analysisResult.textAnalysis || { sentiment: { score: 0 } },
        studentId
      );
    }

    // Store analysis results
    const resultFileName = `analysis/${assignmentId}/${studentId}-analysis.json`;
    const resultFile = bucket.file(resultFileName);
    await resultFile.save(JSON.stringify(analysisResult, null, 2));

    // Publish notification
    await publishNotification('assignment-processed', {
      studentId,
      assignmentId,
      courseId,
      analysisResult: {
        sentiment: analysisResult.textAnalysis?.sentiment,
        keywordCount: analysisResult.textAnalysis?.entities?.length || 0,
        hasAudioFeedback: !!analysisResult.audioFeedback
      },
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Assignment processed successfully',
      results: {
        analysisFile: resultFileName,
        sentiment: analysisResult.textAnalysis?.sentiment,
        entities: analysisResult.textAnalysis?.entities?.slice(0, 5), // Top 5 entities
        audioFeedbackUrl: analysisResult.audioFeedback?.url
      }
    });

  } catch (error) {
    console.error('Assignment processing error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Grade Calculator Function
functions.http('calculateGrade', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const {
      studentId,
      assignmentId,
      submissionData,
      gradingCriteria,
      aiAssisted = true
    } = req.body;

    console.log(`Calculating grade for student ${studentId}, assignment ${assignmentId}`);

    let grade = 0;
    let feedback = [];
    let breakdown = {};

    // AI-assisted grading
    if (aiAssisted && submissionData.textContent) {
      const analysis = await analyzeText(submissionData.textContent);
      
      // Sentiment-based scoring
      const sentimentScore = Math.max(0, (analysis.sentiment.score + 1) * 50); // Convert -1 to 1 range to 0 to 100
      
      // Entity relevance scoring
      const relevantEntities = analysis.entities.filter(entity => 
        gradingCriteria.keywords?.some(keyword => 
          entity.name.toLowerCase().includes(keyword.toLowerCase())
        )
      );
      const relevanceScore = Math.min(100, (relevantEntities.length / (gradingCriteria.keywords?.length || 1)) * 100);

      // Combine scores
      grade = (sentimentScore * 0.3) + (relevanceScore * 0.7);
      
      breakdown = {
        sentiment: {
          score: sentimentScore,
          weight: 0.3,
          feedback: getSentimentFeedback(analysis.sentiment)
        },
        relevance: {
          score: relevanceScore,
          weight: 0.7,
          feedback: getRelevanceFeedback(relevantEntities, gradingCriteria.keywords)
        }
      };

      feedback = [
        breakdown.sentiment.feedback,
        breakdown.relevance.feedback,
        `Found ${relevantEntities.length} relevant topics in your submission.`
      ];
    }

    // Manual criteria checking
    if (gradingCriteria.manual) {
      gradingCriteria.manual.forEach(criterion => {
        // Simple keyword matching for demonstration
        const hasKeyword = submissionData.textContent?.toLowerCase()
          .includes(criterion.keyword?.toLowerCase());
        
        if (hasKeyword) {
          grade += criterion.points;
          feedback.push(`✓ ${criterion.description}`);
        } else {
          feedback.push(`✗ Missing: ${criterion.description}`);
        }
      });
    }

    // Ensure grade is within bounds
    grade = Math.max(0, Math.min(100, Math.round(grade)));

    // Store grading result
    const gradingResult = {
      studentId,
      assignmentId,
      grade,
      feedback,
      breakdown,
      gradedAt: new Date().toISOString(),
      gradedBy: 'AI-Assistant',
      criteria: gradingCriteria
    };

    // Publish grading notification
    await publishNotification('assignment-graded', {
      studentId,
      assignmentId,
      grade,
      feedback: feedback.slice(0, 3), // Top 3 feedback points
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      grade,
      feedback,
      breakdown,
      recommendation: getGradeRecommendation(grade)
    });

  } catch (error) {
    console.error('Grade calculation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Content Moderation Function
functions.http('moderateContent', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const { content, contentType, userId, contextId } = req.body;

    console.log(`Moderating ${contentType} content from user ${userId}`);

    let moderationResult = {
      approved: true,
      confidence: 1.0,
      flags: [],
      suggestions: []
    };

    // Text content moderation
    if (contentType === 'text' && content) {
      const analysis = await analyzeText(content);
      
      // Check sentiment
      if (analysis.sentiment.score < -0.7) {
        moderationResult.flags.push({
          type: 'negative_sentiment',
          severity: 'medium',
          description: 'Content has very negative sentiment'
        });
        moderationResult.approved = false;
      }

      // Check for inappropriate entities
      const inappropriateEntities = analysis.entities.filter(entity => {
        const inappropriateTerms = ['violence', 'hate', 'discrimination'];
        return inappropriateTerms.some(term => 
          entity.name.toLowerCase().includes(term)
        );
      });

      if (inappropriateEntities.length > 0) {
        moderationResult.flags.push({
          type: 'inappropriate_content',
          severity: 'high',
          description: `Found potentially inappropriate content: ${inappropriateEntities.map(e => e.name).join(', ')}`
        });
        moderationResult.approved = false;
      }

      // Educational quality check
      if (content.length < 50) {
        moderationResult.suggestions.push({
          type: 'quality_improvement',
          description: 'Consider providing more detailed content for better educational value'
        });
      }
    }

    // Log moderation result
    await publishNotification('content-moderated', {
      userId,
      contextId,
      contentType,
      approved: moderationResult.approved,
      flagCount: moderationResult.flags.length,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      moderation: moderationResult
    });

  } catch (error) {
    console.error('Content moderation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Email Processing Function
functions.http('processEmail', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const { 
      to, 
      subject, 
      body, 
      type = 'notification',
      priority = 'normal',
      userId,
      metadata = {}
    } = req.body;

    console.log(`Processing ${type} email to ${to}`);

    // Validate email
    if (!to || !subject || !body) {
      throw new Error('Missing required email fields');
    }

    // Process based on type
    let processedEmail = {
      to,
      subject,
      body,
      type,
      priority,
      processedAt: new Date().toISOString(),
      metadata
    };

    // Add educational context for grade notifications
    if (type === 'grade_notification') {
      processedEmail.subject = `📚 Grade Update: ${subject}`;
      processedEmail.body = `
        ${body}
        
        ---
        This is an automated notification from your Educational Management System.
        If you have questions, please contact your instructor.
      `;
    }

    // Add assignment context
    if (type === 'assignment_reminder') {
      processedEmail.subject = `📋 Assignment Reminder: ${subject}`;
      processedEmail.body = `
        ${body}
        
        ---
        Don't forget to submit your assignment on time!
        Need help? Contact your instructor or visit our help center.
      `;
    }

    // Queue email for sending (in real implementation, integrate with SendGrid, Mailgun, etc.)
    await publishNotification('email-queue', {
      email: processedEmail,
      userId,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Email queued for processing',
      emailId: `email_${Date.now()}`,
      processedAt: processedEmail.processedAt
    });

  } catch (error) {
    console.error('Email processing error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Helper Functions
async function analyzeText(text) {
  const document = {
    content: text,
    type: 'PLAIN_TEXT'
  };

  const [sentimentResult] = await language.analyzeSentiment({ document });
  const [entitiesResult] = await language.analyzeEntities({ document });

  return {
    sentiment: sentimentResult.documentSentiment,
    entities: entitiesResult.entities,
    language: sentimentResult.language
  };
}

async function generateAudioFeedback(textAnalysis, studentId) {
  try {
    let feedbackText = 'Great work on your submission! ';
    
    if (textAnalysis.sentiment.score > 0.3) {
      feedbackText += 'Your writing shows positive engagement with the topic. ';
    } else if (textAnalysis.sentiment.score < -0.3) {
      feedbackText += 'Consider exploring more positive aspects of the topic. ';
    }

    feedbackText += 'Keep up the good effort in your studies!';

    const request = {
      input: { text: feedbackText },
      voice: {
        languageCode: 'en-US',
        name: 'en-US-Standard-F', // Female voice for friendlier tone
        ssmlGender: 'FEMALE'
      },
      audioConfig: {
        audioEncoding: 'MP3'
      }
    };

    const [response] = await textToSpeech.synthesizeSpeech(request);
    
    // Upload audio to Cloud Storage
    const bucket = storage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET_MEDIA || 'media-bucket');
    const fileName = `feedback/audio/${studentId}-${Date.now()}.mp3`;
    const file = bucket.file(fileName);
    
    await file.save(response.audioContent);
    
    return {
      fileName,
      url: `gs://${bucket.name}/${fileName}`,
      text: feedbackText
    };
  } catch (error) {
    console.error('Audio feedback generation failed:', error);
    return null;
  }
}

async function publishNotification(topic, message) {
  try {
    const topicName = pubsub.topic(topic);
    const messageData = Buffer.from(JSON.stringify(message));
    
    await topicName.publish(messageData, {
      timestamp: new Date().toISOString(),
      source: 'cloud-functions'
    });
  } catch (error) {
    console.error('Failed to publish notification:', error);
  }
}

function getSentimentFeedback(sentiment) {
  if (sentiment.score > 0.5) {
    return 'Excellent positive tone and engagement with the material!';
  } else if (sentiment.score > 0) {
    return 'Good positive approach to the topic.';
  } else if (sentiment.score > -0.5) {
    return 'Consider expressing ideas with more enthusiasm.';
  } else {
    return 'Try to approach the topic from a more positive perspective.';
  }
}

function getRelevanceFeedback(relevantEntities, keywords) {
  if (relevantEntities.length === 0) {
    return 'Make sure to address the key topics mentioned in the assignment.';
  } else if (relevantEntities.length >= (keywords?.length || 1)) {
    return 'Excellent coverage of the assignment topics!';
  } else {
    return `Good coverage of topics. Consider expanding on: ${keywords?.slice(relevantEntities.length).join(', ') || 'additional aspects'}.`;
  }
}

function getGradeRecommendation(grade) {
  if (grade >= 90) {
    return { level: 'excellent', message: 'Outstanding work! Keep up the excellent performance.' };
  } else if (grade >= 80) {
    return { level: 'good', message: 'Good work! Minor improvements could make this excellent.' };
  } else if (grade >= 70) {
    return { level: 'satisfactory', message: 'Satisfactory work. Focus on addressing feedback to improve.' };
  } else if (grade >= 60) {
    return { level: 'needs_improvement', message: 'Needs improvement. Please review feedback and ask for help if needed.' };
  } else {
    return { level: 'unsatisfactory', message: 'Please see your instructor for additional support and guidance.' };
  }
}
