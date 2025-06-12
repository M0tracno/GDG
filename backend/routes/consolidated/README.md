# Consolidated Routes

This directory contains consolidated route handlers that work with both MongoDB and SQLite database implementations.

## Purpose

These consolidated routes are designed to replace the separate MongoDB and SQLite route implementations, providing a unified API interface regardless of the underlying database. This approach:

1. Reduces code duplication
2. Makes it easier to switch between database types
3. Simplifies maintenance
4. Provides a cleaner project structure

## How It Works

The routes in this directory dynamically load the appropriate controller implementation based on the `config.db.type` setting. This allows them to handle requests correctly whether MongoDB or SQLite is being used.

## Implementation Strategy

For routes that have not yet been consolidated, the server still loads the appropriate version based on the database type.

## Migration Process

As the codebase continues to evolve, more routes should be consolidated using this pattern to gradually simplify the codebase.
