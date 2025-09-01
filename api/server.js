const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Sample CRM data (in-memory database)
const contacts = [
  {
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '+1-555-123-4567',
    email: 'john.doe@example.com'
  },
  {
    firstName: 'Sarah',
    lastName: 'Smith',
    phoneNumber: '+1-555-234-5678',
    email: 'sarah.smith@example.com'
  },
  {
    firstName: 'Mike',
    lastName: 'Johnson',
    phoneNumber: '+1-555-345-6789',
    email: 'mike.johnson@example.com'
  },
  {
    firstName: 'Emily',
    lastName: 'Brown',
    phoneNumber: '+1-555-456-7890',
    email: 'emily.brown@example.com'
  },
  {
    firstName: 'David',
    lastName: 'Wilson',
    phoneNumber: '+1-555-567-8901',
    email: 'david.wilson@example.com'
  }
];

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// API Routes

// Get contact by email
app.get('/api/contacts/by-email', (req, res) => {
  const { email } = req.query;

  // Validate email parameter
  if (!email) {
    return res.status(400).json({ error: 'Email parameter is required' });
  }

  // Validate email format
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Find contact by email (case-insensitive)
  const contact = contacts.find(c => c.email.toLowerCase() === email.toLowerCase());

  if (!contact) {
    return res.status(404).json({ error: 'Contact not found' });
  }

  // Return contact details
  res.json({
    firstName: contact.firstName,
    lastName: contact.lastName,
    phoneNumber: contact.phoneNumber,
    email: contact.email
  });
});

// Get all contacts
app.get('/api/contacts', (req, res) => {
  res.json(contacts);
});

// Serve OpenAPI specification as JSON
app.get('/openapi.json', (req, res) => {
  try {
    const yamlPath = path.join(__dirname, '..', 'appPackage', 'actions', 'crm-openapi.yaml');
    const swaggerDocument = YAML.load(yamlPath);
    res.json(swaggerDocument);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load OpenAPI specification' });
  }
});

// Swagger UI documentation
app.use('/api-docs', (req, res, next) => {
  try {
    const yamlPath = path.join(__dirname, '..', 'appPackage', 'actions', 'crm-openapi.yaml');
    const swaggerDocument = YAML.load(yamlPath);
    swaggerUi.serve(req, res, () => {
      swaggerUi.setup(swaggerDocument)(req, res, next);
    });
  } catch (error) {
    res.status(500).send('Failed to load API documentation');
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'CRM Contact API Server',
    version: '1.0.0',
    endpoints: {
      'GET /api/contacts/by-email': 'Get contact by email address',
      'GET /api/contacts': 'Get all contacts',
      'GET /api-docs': 'Swagger UI documentation',
      'GET /openapi.json': 'OpenAPI specification',
      'GET /health': 'Health check'
    },
    sampleContacts: contacts.map(c => c.email)
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`CRM API Server running on http://localhost:${PORT}`);
  console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
  console.log('\nSample contacts in the database:');
  contacts.forEach(contact => {
    console.log(`  - ${contact.email}: ${contact.firstName} ${contact.lastName}, ${contact.phoneNumber}`);
  });
});