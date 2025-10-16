# Configuration Directory

This directory contains the Sequelize database configuration.

## Setup

1. Copy the example config file:
   ```bash
   cp config/config.example.json config/config.json
   ```

2. Edit `config/config.json` and update the credentials:
   - `username`: Your PostgreSQL username (default: postgres)
   - `password`: Your PostgreSQL password
   - `database`: Database name for each environment
   - `host`: Database server host (default: 127.0.0.1)
   - `port`: Database server port (default: 5432)

## Files

- **config.example.json** - Template configuration file (committed to git)
- **config.json** - Your actual configuration (ignored by git, contains credentials)

## Security Note

The `config.json` file is in `.gitignore` to prevent accidentally committing database credentials to version control. Always use `config.example.json` as a template and create your own `config.json` locally.
