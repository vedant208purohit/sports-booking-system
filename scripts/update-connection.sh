#!/bin/bash

echo "=========================================="
echo "Supabase Connection String Helper"
echo "=========================================="
echo ""
echo "Your current connection string is timing out."
echo ""
echo "Please follow these steps:"
echo ""
echo "1. Go to: https://supabase.com/dashboard"
echo "2. Select your project"
echo "3. Click 'Project Settings' (gear icon)"
echo "4. Click 'Database'"
echo "5. Scroll to 'Connection string' section"
echo "6. Select 'Transaction' mode (NOT Session)"
echo "7. Copy the connection string"
echo ""
echo "The connection string should look like:"
echo "postgresql://postgres.xxxxx:password@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
echo ""
echo "Paste your NEW connection string here (or press Enter to skip):"
read -r new_connection

if [ -n "$new_connection" ]; then
    # Add sslmode=require if not present
    if [[ ! "$new_connection" == *"sslmode"* ]]; then
        if [[ "$new_connection" == *"?"* ]]; then
            new_connection="${new_connection}&sslmode=require"
        else
            new_connection="${new_connection}?sslmode=require"
        fi
    fi
    
    # Update .env file
    sed -i '' "s|DATABASE_URL=.*|DATABASE_URL=${new_connection}|" .env
    echo ""
    echo "✅ Updated .env file!"
    echo ""
    echo "New DATABASE_URL:"
    grep DATABASE_URL .env
    echo ""
    echo "Now test the connection:"
    echo "  node scripts/test-connection.js"
else
    echo ""
    echo "Skipped. Please manually update .env file with Transaction mode connection string."
fi

