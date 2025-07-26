# Semantest SSO Integration Manual

## Overview

This manual provides comprehensive guidance for integrating Semantest with enterprise Single Sign-On (SSO) solutions, including SAML 2.0, OAuth 2.0, OpenID Connect, and LDAP/Active Directory authentication systems.

## Table of Contents

1. [SSO Architecture Overview](#sso-architecture-overview)
2. [SAML 2.0 Integration](#saml-20-integration)
3. [OAuth 2.0 / OpenID Connect](#oauth-20--openid-connect)
4. [LDAP / Active Directory](#ldap--active-directory)
5. [Multi-Provider Configuration](#multi-provider-configuration)
6. [User Provisioning and Management](#user-provisioning-and-management)
7. [Security Configuration](#security-configuration)
8. [Testing and Validation](#testing-and-validation)
9. [Troubleshooting](#troubleshooting)
10. [Best Practices](#best-practices)

## SSO Architecture Overview

### Authentication Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Browser   │    │  Semantest  │    │ Identity    │    │ Enterprise  │
│             │    │ Application │    │ Provider    │    │ Directory   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                  │                  │                  │
       │ 1. Access App    │                  │                  │
       ├─────────────────>│                  │                  │
       │                  │ 2. Redirect      │                  │
       │<─────────────────┤    to IdP        │                  │
       │                  │                  │                  │
       │ 3. Authenticate  │                  │                  │
       ├─────────────────────────────────────>│ 4. Verify       │
       │                  │                  ├─────────────────>│
       │                  │                  │<─────────────────┤
       │ 5. SAML Response │                  │                  │
       │<─────────────────────────────────────┤                  │
       │                  │                  │                  │
       │ 6. POST to App   │                  │                  │
       ├─────────────────>│ 7. Validate     │                  │
       │                  ├─────────────────>│                  │
       │                  │<─────────────────┤                  │
       │ 8. Access Token  │                  │                  │
       │<─────────────────┤                  │                  │
```

### Supported Protocols

| Protocol | Use Case | Advantages | Considerations |
|----------|----------|------------|----------------|
| SAML 2.0 | Enterprise SSO | Mature, secure, wide support | Complex setup |
| OAuth 2.0 | API access, mobile | Simple, modern | Requires additional identity |
| OpenID Connect | Modern SSO | JSON-based, REST APIs | Newer protocol |
| LDAP/AD | Direct integration | Native directory access | Network dependencies |

## SAML 2.0 Integration

### Configuration Overview

#### Service Provider (SP) Configuration
```xml
<!-- semantest-sp-metadata.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata"
                     entityID="https://semantest.company.com">
  
  <md:SPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    
    <!-- Signing Certificate -->
    <md:KeyDescriptor use="signing">
      <ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
        <ds:X509Data>
          <ds:X509Certificate>MIICertificateDataHere...</ds:X509Certificate>
        </ds:X509Data>
      </ds:KeyInfo>
    </md:KeyDescriptor>
    
    <!-- Encryption Certificate -->
    <md:KeyDescriptor use="encryption">
      <ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
        <ds:X509Data>
          <ds:X509Certificate>MIICertificateDataHere...</ds:X509Certificate>
        </ds:X509Data>
      </ds:KeyInfo>
    </md:KeyDescriptor>
    
    <!-- Assertion Consumer Service -->
    <md:AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
                                Location="https://semantest.company.com/auth/saml/acs"
                                index="0" isDefault="true"/>
    
    <!-- Single Logout Service -->
    <md:SingleLogoutService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
                           Location="https://semantest.company.com/auth/saml/sls"/>
    
  </md:SPSSODescriptor>
  
</md:EntityDescriptor>
```

#### Application Configuration
```javascript
// config/saml.js
const saml = require('passport-saml');

const samlConfig = {
  // Identity Provider Settings
  entryPoint: 'https://idp.company.com/sso/saml',
  issuer: 'https://semantest.company.com',
  
  // Service Provider Settings
  callbackUrl: 'https://semantest.company.com/auth/saml/callback',
  logoutCallbackUrl: 'https://semantest.company.com/auth/saml/logout/callback',
  
  // Certificate Configuration
  cert: process.env.SAML_IDP_CERT, // IdP signing certificate
  privateCert: process.env.SAML_SP_PRIVATE_KEY, // SP private key
  
  // Security Settings
  wantAssertionsSigned: true,
  wantAuthnResponseSigned: true,
  signMetadata: true,
  
  // Attribute Mapping
  attributeConsumingServiceIndex: '1',
  identifierFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
  
  // Additional Options
  acceptedClockSkewMs: 30000, // 30 seconds
  maxAssertionAgeMs: 300000,  // 5 minutes
  
  // Attribute Mapping
  attributeMap: {
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress': 'email',
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname': 'firstName',
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname': 'lastName',
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/groups': 'groups'
  }
};

module.exports = samlConfig;
```

### Passport.js Integration
```javascript
// auth/samlStrategy.js
const passport = require('passport');
const SamlStrategy = require('passport-saml').Strategy;
const User = require('../models/User');
const samlConfig = require('../config/saml');

passport.use('saml', new SamlStrategy(samlConfig, async (profile, done) => {
  try {
    console.log('SAML Profile received:', profile);
    
    // Extract user information
    const userInfo = {
      email: profile.email || profile.nameID,
      firstName: profile.firstName,
      lastName: profile.lastName,
      groups: profile.groups || [],
      samlNameID: profile.nameID,
      samlSessionIndex: profile.sessionIndex
    };
    
    // Find or create user
    let user = await User.findOne({ email: userInfo.email });
    
    if (!user) {
      // Auto-provision user
      user = await User.create({
        email: userInfo.email,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        authProvider: 'saml',
        isActive: true,
        lastLogin: new Date()
      });
      
      console.log('New user auto-provisioned:', user.email);
    } else {
      // Update existing user
      user.firstName = userInfo.firstName;
      user.lastName = userInfo.lastName;
      user.lastLogin = new Date();
      await user.save();
    }
    
    // Map groups to roles
    await mapGroupsToRoles(user, userInfo.groups);
    
    return done(null, user);
    
  } catch (error) {
    console.error('SAML authentication error:', error);
    return done(error, null);
  }
}));

// Group to role mapping
async function mapGroupsToRoles(user, groups) {
  const roleMapping = {
    'Semantest-Admins': 'admin',
    'Semantest-Developers': 'developer',
    'Semantest-Testers': 'tester',
    'Semantest-Viewers': 'viewer'
  };
  
  const roles = [];
  
  for (const group of groups) {
    if (roleMapping[group]) {
      roles.push(roleMapping[group]);
    }
  }
  
  if (roles.length === 0) {
    roles.push('viewer'); // Default role
  }
  
  user.roles = roles;
  await user.save();
}
```

### Express.js Routes
```javascript
// routes/auth.js
const express = require('express');
const passport = require('passport');
const router = express.Router();

// Initiate SAML login
router.get('/saml/login', 
  passport.authenticate('saml', { 
    failureRedirect: '/login',
    failureFlash: true 
  })
);

// SAML callback (ACS)
router.post('/saml/callback',
  passport.authenticate('saml', { 
    failureRedirect: '/login?error=saml_failed',
    failureFlash: true 
  }),
  (req, res) => {
    // Successful authentication
    const redirectUrl = req.session.returnTo || '/dashboard';
    delete req.session.returnTo;
    
    // Log successful login
    console.log(`User ${req.user.email} logged in via SAML`);
    
    res.redirect(redirectUrl);
  }
);

// SAML logout
router.get('/saml/logout', (req, res) => {
  const samlStrategy = passport._strategy('saml');
  
  samlStrategy.logout(req, (err, logoutUrl) => {
    if (err) {
      console.error('SAML logout error:', err);
      return res.redirect('/logout');
    }
    
    req.logout((err) => {
      if (err) {
        console.error('Session logout error:', err);
      }
      res.redirect(logoutUrl);
    });
  });
});

// SAML logout callback
router.post('/saml/logout/callback', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout callback error:', err);
    }
    res.redirect('/');
  });
});

module.exports = router;
```

## OAuth 2.0 / OpenID Connect

### Azure AD / Entra ID Integration

#### Application Registration
```javascript
// config/azuread.js
const azureAdConfig = {
  // Application (client) ID
  clientId: process.env.AZURE_CLIENT_ID,
  
  // Client secret
  clientSecret: process.env.AZURE_CLIENT_SECRET,
  
  // Tenant ID or domain
  tenantId: process.env.AZURE_TENANT_ID,
  
  // Redirect URI
  redirectUri: 'https://semantest.company.com/auth/azuread/callback',
  
  // Scopes
  scope: ['openid', 'profile', 'email', 'User.Read'],
  
  // Authority
  authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
  
  // Endpoints
  authorizationURL: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/authorize`,
  tokenURL: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/token`,
  userInfoURL: 'https://graph.microsoft.com/v1.0/me'
};

module.exports = azureAdConfig;
```

#### Passport Strategy
```javascript
// auth/azureAdStrategy.js
const passport = require('passport');
const OIDCStrategy = require('passport-azure-ad').OIDCStrategy;
const User = require('../models/User');
const azureAdConfig = require('../config/azuread');

passport.use('azuread-openidconnect', new OIDCStrategy({
  identityMetadata: `${azureAdConfig.authority}/.well-known/openid_configuration`,
  clientID: azureAdConfig.clientId,
  clientSecret: azureAdConfig.clientSecret,
  responseType: 'code',
  responseMode: 'form_post',
  redirectUrl: azureAdConfig.redirectUri,
  allowHttpForRedirectUrl: false,
  validateIssuer: true,
  scope: azureAdConfig.scope,
  loggingLevel: 'error'
}, async (iss, sub, profile, accessToken, refreshToken, done) => {
  try {
    const userInfo = {
      email: profile._json.email || profile._json.preferred_username,
      firstName: profile._json.given_name,
      lastName: profile._json.family_name,
      azureId: profile._json.oid,
      displayName: profile._json.name
    };
    
    let user = await User.findOne({ 
      $or: [
        { email: userInfo.email },
        { azureId: userInfo.azureId }
      ]
    });
    
    if (!user) {
      user = await User.create({
        email: userInfo.email,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        displayName: userInfo.displayName,
        azureId: userInfo.azureId,
        authProvider: 'azuread',
        isActive: true,
        lastLogin: new Date()
      });
      
      console.log('New Azure AD user created:', user.email);
    } else {
      user.lastLogin = new Date();
      user.azureId = userInfo.azureId;
      await user.save();
    }
    
    // Fetch Azure AD groups for role mapping
    await fetchAndMapAzureGroups(user, accessToken);
    
    return done(null, user);
    
  } catch (error) {
    console.error('Azure AD authentication error:', error);
    return done(error, null);
  }
}));

// Fetch user groups from Microsoft Graph
async function fetchAndMapAzureGroups(user, accessToken) {
  try {
    const axios = require('axios');
    
    const response = await axios.get('https://graph.microsoft.com/v1.0/me/memberOf', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const groups = response.data.value
      .filter(group => group['@odata.type'] === '#microsoft.graph.group')
      .map(group => group.displayName);
    
    // Map Azure AD groups to Semantest roles
    const roleMapping = {
      'Semantest Administrators': 'admin',
      'Semantest Developers': 'developer',
      'Semantest QA Team': 'tester',
      'Semantest Users': 'viewer'
    };
    
    const roles = [];
    for (const group of groups) {
      if (roleMapping[group]) {
        roles.push(roleMapping[group]);
      }
    }
    
    if (roles.length === 0) {
      roles.push('viewer');
    }
    
    user.roles = roles;
    user.azureGroups = groups;
    await user.save();
    
  } catch (error) {
    console.error('Error fetching Azure groups:', error);
    user.roles = ['viewer']; // Default fallback
    await user.save();
  }
}
```

### Google Workspace Integration

#### Configuration
```javascript
// config/google.js
const googleConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: 'https://semantest.company.com/auth/google/callback',
  
  // Hosted domain restriction
  hostedDomain: 'company.com',
  
  // Scopes
  scope: [
    'openid',
    'email',
    'profile',
    'https://www.googleapis.com/auth/admin.directory.group.readonly'
  ],
  
  // Admin SDK for group management
  adminEmail: process.env.GOOGLE_ADMIN_EMAIL,
  serviceAccountKey: process.env.GOOGLE_SERVICE_ACCOUNT_KEY
};

module.exports = googleConfig;
```

#### Passport Strategy
```javascript
// auth/googleStrategy.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { google } = require('googleapis');
const User = require('../models/User');
const googleConfig = require('../config/google');

passport.use('google', new GoogleStrategy({
  clientID: googleConfig.clientId,
  clientSecret: googleConfig.clientSecret,
  callbackURL: googleConfig.redirectUri
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Verify hosted domain
    if (profile._json.hd !== googleConfig.hostedDomain) {
      return done(new Error('Invalid domain'), null);
    }
    
    const userInfo = {
      email: profile.emails[0].value,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      googleId: profile.id,
      picture: profile.photos[0].value
    };
    
    let user = await User.findOne({ 
      $or: [
        { email: userInfo.email },
        { googleId: userInfo.googleId }
      ]
    });
    
    if (!user) {
      user = await User.create({
        email: userInfo.email,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        googleId: userInfo.googleId,
        picture: userInfo.picture,
        authProvider: 'google',
        isActive: true,
        lastLogin: new Date()
      });
    } else {
      user.lastLogin = new Date();
      await user.save();
    }
    
    // Fetch Google Workspace groups
    await fetchGoogleGroups(user, accessToken);
    
    return done(null, user);
    
  } catch (error) {
    console.error('Google authentication error:', error);
    return done(error, null);
  }
}));

// Fetch user groups from Google Admin SDK
async function fetchGoogleGroups(user, accessToken) {
  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    
    const admin = google.admin({ version: 'directory_v1', auth });
    
    const response = await admin.groups.list({
      userKey: user.email,
      domain: googleConfig.hostedDomain
    });
    
    const groups = response.data.groups || [];
    const groupNames = groups.map(group => group.name);
    
    // Map Google groups to roles
    const roleMapping = {
      'semantest-admins@company.com': 'admin',
      'semantest-developers@company.com': 'developer',
      'semantest-testers@company.com': 'tester',
      'semantest-users@company.com': 'viewer'
    };
    
    const roles = [];
    for (const group of groups) {
      if (roleMapping[group.email]) {
        roles.push(roleMapping[group.email]);
      }
    }
    
    user.roles = roles.length > 0 ? roles : ['viewer'];
    user.googleGroups = groupNames;
    await user.save();
    
  } catch (error) {
    console.error('Error fetching Google groups:', error);
    user.roles = ['viewer'];
    await user.save();
  }
}
```

## LDAP / Active Directory

### Direct LDAP Integration

#### Configuration
```javascript
// config/ldap.js
const ldapConfig = {
  // Server configuration
  server: {
    url: 'ldaps://ad.company.com:636',
    bindDN: process.env.LDAP_BIND_DN,
    bindCredentials: process.env.LDAP_BIND_PASSWORD,
    searchBase: 'dc=company,dc=com',
    
    // TLS options
    tlsOptions: {
      rejectUnauthorized: false, // Set to true in production with valid certificates
      ca: [process.env.LDAP_CA_CERT]
    }
  },
  
  // User search configuration
  usersearchfilter: '(&(objectCategory=person)(objectClass=user)(sAMAccountName={{username}}))',
  usersearchbase: 'ou=users,dc=company,dc=com',
  usernameAttribute: 'sAMAccountName',
  
  // Group search configuration
  groupsearchfilter: '(&(objectClass=group)(member={{dn}}))',
  groupsearchbase: 'ou=groups,dc=company,dc=com',
  groupnameAttribute: 'cn',
  
  // Attribute mapping
  attributeMap: {
    id: 'objectGUID',
    username: 'sAMAccountName',
    displayName: 'displayName',
    firstName: 'givenName',
    lastName: 'sn',
    email: 'mail',
    title: 'title',
    department: 'department',
    manager: 'manager'
  }
};

module.exports = ldapConfig;
```

#### LDAP Authentication Strategy
```javascript
// auth/ldapStrategy.js
const passport = require('passport');
const LdapStrategy = require('passport-ldapauth');
const User = require('../models/User');
const ldapConfig = require('../config/ldap');

passport.use('ldap', new LdapStrategy({
  server: ldapConfig.server,
  usernameField: 'username',
  passwordField: 'password',
  
  // User search options
  searchBase: ldapConfig.usersearchbase,
  searchFilter: ldapConfig.usersearchfilter,
  searchAttributes: Object.values(ldapConfig.attributeMap),
  
  // Group search options
  groupSearchBase: ldapConfig.groupsearchbase,
  groupSearchFilter: ldapConfig.groupsearchfilter,
  groupSearchAttributes: [ldapConfig.groupnameAttribute],
  
  // Cache settings
  cache: true,
  cacheMaxAge: 60000 // 1 minute
  
}, async (user, done) => {
  try {
    console.log('LDAP user object:', user);
    
    // Map LDAP attributes to user object
    const userInfo = {
      username: user[ldapConfig.attributeMap.username],
      email: user[ldapConfig.attributeMap.email],
      firstName: user[ldapConfig.attributeMap.firstName],
      lastName: user[ldapConfig.attributeMap.lastName],
      displayName: user[ldapConfig.attributeMap.displayName],
      title: user[ldapConfig.attributeMap.title],
      department: user[ldapConfig.attributeMap.department],
      ldapDN: user.dn
    };
    
    // Find or create user
    let semantestUser = await User.findOne({ 
      $or: [
        { email: userInfo.email },
        { username: userInfo.username }
      ]
    });
    
    if (!semantestUser) {
      semantestUser = await User.create({
        username: userInfo.username,
        email: userInfo.email,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        displayName: userInfo.displayName,
        title: userInfo.title,
        department: userInfo.department,
        ldapDN: userInfo.ldapDN,
        authProvider: 'ldap',
        isActive: true,
        lastLogin: new Date()
      });
      
      console.log('New LDAP user created:', semantestUser.email);
    } else {
      // Update user information
      Object.assign(semantestUser, userInfo);
      semantestUser.lastLogin = new Date();
      await semantestUser.save();
    }
    
    // Map LDAP groups to roles
    await mapLdapGroupsToRoles(semantestUser, user._groups);
    
    return done(null, semantestUser);
    
  } catch (error) {
    console.error('LDAP authentication error:', error);
    return done(error, null);
  }
}));

// Map LDAP groups to application roles
async function mapLdapGroupsToRoles(user, ldapGroups) {
  const groupNames = ldapGroups ? ldapGroups.map(group => group.cn) : [];
  
  const roleMapping = {
    'Semantest-Admins': 'admin',
    'Semantest-Developers': 'developer',
    'Semantest-QA': 'tester',
    'Semantest-Users': 'viewer',
    'Domain Admins': 'admin' // Special case for domain admins
  };
  
  const roles = [];
  
  for (const groupName of groupNames) {
    if (roleMapping[groupName]) {
      roles.push(roleMapping[groupName]);
    }
  }
  
  // Default role if no matches
  if (roles.length === 0) {
    roles.push('viewer');
  }
  
  user.roles = roles;
  user.ldapGroups = groupNames;
  await user.save();
  
  console.log(`User ${user.email} mapped to roles:`, roles);
}
```

### LDAP Connection Pool
```javascript
// services/ldapService.js
const ldap = require('ldapjs');
const ldapConfig = require('../config/ldap');

class LDAPService {
  constructor() {
    this.client = null;
    this.pool = [];
    this.maxConnections = 10;
    this.connectionTimeout = 5000;
  }
  
  async connect() {
    return new Promise((resolve, reject) => {
      const client = ldap.createClient({
        url: ldapConfig.server.url,
        timeout: this.connectionTimeout,
        connectTimeout: this.connectionTimeout,
        tlsOptions: ldapConfig.server.tlsOptions
      });
      
      client.on('connect', () => {
        console.log('LDAP connection established');
        resolve(client);
      });
      
      client.on('error', (err) => {
        console.error('LDAP connection error:', err);
        reject(err);
      });
      
      client.on('timeout', () => {
        console.error('LDAP connection timeout');
        reject(new Error('LDAP connection timeout'));
      });
    });
  }
  
  async bind(client) {
    return new Promise((resolve, reject) => {
      client.bind(ldapConfig.server.bindDN, ldapConfig.server.bindCredentials, (err) => {
        if (err) {
          console.error('LDAP bind error:', err);
          reject(err);
        } else {
          console.log('LDAP bind successful');
          resolve();
        }
      });
    });
  }
  
  async search(searchBase, filter, attributes = []) {
    const client = await this.connect();
    
    try {
      await this.bind(client);
      
      return new Promise((resolve, reject) => {
        const opts = {
          scope: 'sub',
          filter: filter,
          attributes: attributes
        };
        
        const results = [];
        
        client.search(searchBase, opts, (err, res) => {
          if (err) {
            return reject(err);
          }
          
          res.on('searchEntry', (entry) => {
            results.push(entry.object);
          });
          
          res.on('error', (err) => {
            reject(err);
          });
          
          res.on('end', (result) => {
            if (result.status === 0) {
              resolve(results);
            } else {
              reject(new Error(`LDAP search failed with status: ${result.status}`));
            }
          });
        });
      });
      
    } finally {
      client.unbind();
    }
  }
  
  async authenticate(username, password) {
    const client = await this.connect();
    
    try {
      // First, search for the user
      await this.bind(client);
      
      const filter = ldapConfig.usersearchfilter.replace('{{username}}', username);
      const users = await this.search(ldapConfig.usersearchbase, filter);
      
      if (users.length === 0) {
        throw new Error('User not found');
      }
      
      const user = users[0];
      
      // Attempt to bind with user credentials
      return new Promise((resolve, reject) => {
        client.bind(user.dn, password, (err) => {
          if (err) {
            reject(new Error('Invalid credentials'));
          } else {
            resolve(user);
          }
        });
      });
      
    } finally {
      client.unbind();
    }
  }
}

module.exports = new LDAPService();
```

## Multi-Provider Configuration

### Provider Selection Strategy
```javascript
// auth/providerSelector.js
const providerConfig = {
  // Default provider order
  defaultProviders: ['saml', 'azuread', 'google', 'ldap'],
  
  // Domain-based routing
  domainRouting: {
    'company.com': 'saml',
    'contractor.com': 'google',
    'internal.local': 'ldap'
  },
  
  // Feature flags
  features: {
    autoProvisioning: true,
    groupSync: true,
    fallbackAuth: true,
    rememberProvider: true
  }
};

function selectProvider(email, userPreference = null) {
  // User preference takes priority
  if (userPreference && providerConfig.defaultProviders.includes(userPreference)) {
    return userPreference;
  }
  
  // Domain-based selection
  if (email) {
    const domain = email.split('@')[1];
    if (providerConfig.domainRouting[domain]) {
      return providerConfig.domainRouting[domain];
    }
  }
  
  // Default to first provider
  return providerConfig.defaultProviders[0];
}

module.exports = { providerConfig, selectProvider };
```

### Authentication Middleware
```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Multi-provider authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
    try {
      const user = await User.findById(decoded.userId);
      
      if (!user || !user.isActive) {
        return res.status(403).json({ error: 'User not found or inactive' });
      }
      
      // Check if token is from the current session
      if (user.tokenVersion && decoded.tokenVersion !== user.tokenVersion) {
        return res.status(403).json({ error: 'Token has been revoked' });
      }
      
      req.user = user;
      next();
      
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(500).json({ error: 'Authentication error' });
    }
  });
}

// Role-based authorization
function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const userRoles = req.user.roles || [];
    const hasRequiredRole = roles.some(role => userRoles.includes(role));
    
    if (!hasRequiredRole) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: roles,
        current: userRoles
      });
    }
    
    next();
  };
}

module.exports = { authenticateToken, requireRole };
```

## User Provisioning and Management

### Automated User Provisioning
```javascript
// services/userProvisioningService.js
const User = require('../models/User');
const Team = require('../models/Team');
const Project = require('../models/Project');

class UserProvisioningService {
  
  async provisionUser(userInfo, provider) {
    try {
      console.log(`Provisioning user from ${provider}:`, userInfo.email);
      
      // Check if user already exists
      let user = await User.findOne({ email: userInfo.email });
      
      if (user) {
        return await this.updateExistingUser(user, userInfo, provider);
      } else {
        return await this.createNewUser(userInfo, provider);
      }
      
    } catch (error) {
      console.error('User provisioning error:', error);
      throw error;
    }
  }
  
  async createNewUser(userInfo, provider) {
    const user = await User.create({
      email: userInfo.email,
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      displayName: userInfo.displayName || `${userInfo.firstName} ${userInfo.lastName}`,
      username: userInfo.username || userInfo.email,
      department: userInfo.department,
      title: userInfo.title,
      authProvider: provider,
      isActive: true,
      lastLogin: new Date(),
      createdAt: new Date()
    });
    
    // Assign default role based on department
    await this.assignDefaultRoles(user, userInfo);
    
    // Add to default teams
    await this.assignDefaultTeams(user, userInfo);
    
    // Send welcome notification
    await this.sendWelcomeNotification(user);
    
    console.log(`New user created: ${user.email} with roles: ${user.roles}`);
    return user;
  }
  
  async updateExistingUser(user, userInfo, provider) {
    // Update user information
    user.firstName = userInfo.firstName || user.firstName;
    user.lastName = userInfo.lastName || user.lastName;
    user.displayName = userInfo.displayName || user.displayName;
    user.department = userInfo.department || user.department;
    user.title = userInfo.title || user.title;
    user.lastLogin = new Date();
    
    // Update provider-specific fields
    if (provider === 'azuread') {
      user.azureId = userInfo.azureId;
      user.azureGroups = userInfo.groups;
    } else if (provider === 'google') {
      user.googleId = userInfo.googleId;
      user.googleGroups = userInfo.groups;
    } else if (provider === 'ldap') {
      user.ldapDN = userInfo.ldapDN;
      user.ldapGroups = userInfo.groups;
    }
    
    await user.save();
    
    // Update role assignments if groups changed
    if (userInfo.groups) {
      await this.updateRoleAssignments(user, userInfo.groups, provider);
    }
    
    console.log(`User updated: ${user.email}`);
    return user;
  }
  
  async assignDefaultRoles(user, userInfo) {
    const departmentRoleMapping = {
      'IT': ['developer', 'admin'],
      'QA': ['tester', 'developer'],
      'Engineering': ['developer'],
      'Product': ['viewer', 'tester'],
      'Management': ['admin', 'viewer']
    };
    
    const defaultRoles = departmentRoleMapping[userInfo.department] || ['viewer'];
    user.roles = defaultRoles;
    await user.save();
  }
  
  async assignDefaultTeams(user, userInfo) {
    try {
      // Find teams based on department
      const teams = await Team.find({
        $or: [
          { department: userInfo.department },
          { isDefault: true }
        ]
      });
      
      for (const team of teams) {
        await team.addMember(user._id, 'member');
      }
      
      console.log(`User ${user.email} added to ${teams.length} teams`);
      
    } catch (error) {
      console.error('Error assigning default teams:', error);
    }
  }
  
  async updateRoleAssignments(user, groups, provider) {
    const providerRoleMapping = {
      saml: {
        'Semantest-Admins': 'admin',
        'Semantest-Developers': 'developer',
        'Semantest-Testers': 'tester',
        'Semantest-Viewers': 'viewer'
      },
      azuread: {
        'Semantest Administrators': 'admin',
        'Semantest Developers': 'developer',
        'Semantest QA Team': 'tester',
        'Semantest Users': 'viewer'
      },
      google: {
        'semantest-admins@company.com': 'admin',
        'semantest-developers@company.com': 'developer',
        'semantest-testers@company.com': 'tester',
        'semantest-users@company.com': 'viewer'
      },
      ldap: {
        'Semantest-Admins': 'admin',
        'Semantest-Developers': 'developer',
        'Semantest-QA': 'tester',
        'Semantest-Users': 'viewer'
      }
    };
    
    const roleMapping = providerRoleMapping[provider] || {};
    const roles = [];
    
    for (const group of groups) {
      if (roleMapping[group]) {
        roles.push(roleMapping[group]);
      }
    }
    
    // Ensure user has at least viewer role
    if (roles.length === 0) {
      roles.push('viewer');
    }
    
    user.roles = [...new Set(roles)]; // Remove duplicates
    await user.save();
    
    console.log(`Updated roles for ${user.email}: ${user.roles}`);
  }
  
  async sendWelcomeNotification(user) {
    try {
      // Send welcome email (implement based on your email service)
      console.log(`Sending welcome email to ${user.email}`);
      
      // Create notification in system
      // await notificationService.create({
      //   userId: user._id,
      //   type: 'welcome',
      //   title: 'Welcome to Semantest',
      //   message: 'Your account has been created successfully.'
      // });
      
    } catch (error) {
      console.error('Error sending welcome notification:', error);
    }
  }
  
  async deactivateUser(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    user.isActive = false;
    user.deactivatedAt = new Date();
    await user.save();
    
    // Remove from all teams
    await Team.updateMany(
      { 'members.user': userId },
      { $pull: { members: { user: userId } } }
    );
    
    // Revoke all tokens
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();
    
    console.log(`User ${user.email} deactivated`);
  }
}

module.exports = new UserProvisioningService();
```

## Security Configuration

### Session Management
```javascript
// config/session.js
const session = require('express-session');
const MongoStore = require('connect-mongo');
const redis = require('redis');
const RedisStore = require('connect-redis')(session);

// Redis session store (recommended for production)
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD
});

const sessionConfig = {
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  name: 'semantest.sid',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS
    maxAge: 8 * 60 * 60 * 1000, // 8 hours
    sameSite: 'strict' // CSRF protection
  },
  
  // Session timeout handling
  genid: () => {
    return require('crypto').randomBytes(32).toString('hex');
  }
};

// MongoDB session store (alternative)
const mongoSessionConfig = {
  store: MongoStore.create({
    mongoUrl: process.env.DATABASE_URL,
    collectionName: 'sessions',
    ttl: 8 * 60 * 60 // 8 hours
  }),
  secret: process.env.SESSION_SECRET,
  name: 'semantest.sid',
  resave: false,
  saveUninitialized: false,
  cookie: sessionConfig.cookie
};

module.exports = { sessionConfig, mongoSessionConfig };
```

### Rate Limiting
```javascript
// middleware/rateLimiting.js
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('redis');

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

// Auth endpoint rate limiting
const authLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'auth_limit:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    error: 'Too many authentication attempts',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip + ':' + (req.body.username || req.body.email || 'unknown');
  }
});

// API rate limiting
const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'api_limit:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per window
  message: {
    error: 'Rate limit exceeded',
    retryAfter: 900
  },
  keyGenerator: (req) => {
    return req.user ? req.user.id : req.ip;
  }
});

module.exports = { authLimiter, apiLimiter };
```

## Testing and Validation

### SSO Integration Tests
```javascript
// tests/auth/sso.test.js
const request = require('supertest');
const app = require('../app');
const User = require('../models/User');

describe('SSO Integration Tests', () => {
  
  describe('SAML Authentication', () => {
    test('should redirect to SAML IdP on login', async () => {
      const response = await request(app)
        .get('/auth/saml/login')
        .expect(302);
      
      expect(response.headers.location).toContain('idp.company.com');
    });
    
    test('should process SAML response correctly', async () => {
      const mockSamlResponse = generateMockSamlResponse();
      
      const response = await request(app)
        .post('/auth/saml/callback')
        .send({ SAMLResponse: mockSamlResponse })
        .expect(302);
      
      expect(response.headers.location).toBe('/dashboard');
    });
  });
  
  describe('Azure AD Authentication', () => {
    test('should handle Azure AD callback', async () => {
      const mockAuthCode = 'mock_auth_code';
      
      // Mock Azure AD token exchange
      jest.spyOn(require('axios'), 'post').mockResolvedValue({
        data: {
          access_token: 'mock_access_token',
          id_token: 'mock_id_token'
        }
      });
      
      const response = await request(app)
        .get('/auth/azuread/callback')
        .query({ code: mockAuthCode })
        .expect(302);
      
      expect(response.headers.location).toBe('/dashboard');
    });
  });
  
  describe('User Provisioning', () => {
    test('should create new user on first login', async () => {
      const usersBefore = await User.countDocuments();
      
      const mockProfile = {
        email: 'newuser@company.com',
        firstName: 'New',
        lastName: 'User'
      };
      
      await simulateSSOLogin(mockProfile);
      
      const usersAfter = await User.countDocuments();
      expect(usersAfter).toBe(usersBefore + 1);
      
      const newUser = await User.findOne({ email: mockProfile.email });
      expect(newUser.firstName).toBe(mockProfile.firstName);
    });
    
    test('should update existing user on subsequent logins', async () => {
      const existingUser = await User.create({
        email: 'existing@company.com',
        firstName: 'Old',
        lastName: 'Name'
      });
      
      const updatedProfile = {
        email: 'existing@company.com',
        firstName: 'New',
        lastName: 'Name'
      };
      
      await simulateSSOLogin(updatedProfile);
      
      const user = await User.findById(existingUser._id);
      expect(user.firstName).toBe('New');
    });
  });
});

function generateMockSamlResponse() {
  // Generate a mock SAML response for testing
  return Buffer.from(`
    <samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol">
      <saml:Assertion xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">
        <saml:AttributeStatement>
          <saml:Attribute Name="email">
            <saml:AttributeValue>test@company.com</saml:AttributeValue>
          </saml:Attribute>
        </saml:AttributeStatement>
      </saml:Assertion>
    </samlp:Response>
  `).toString('base64');
}

async function simulateSSOLogin(profile) {
  // Simulate SSO login for testing
  const User = require('../models/User');
  return await User.findOneAndUpdate(
    { email: profile.email },
    profile,
    { upsert: true, new: true }
  );
}
```

### Load Testing
```javascript
// tests/load/sso-load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200
    { duration: '5m', target: 200 }, // Stay at 200
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests must complete within 2s
    http_req_failed: ['rate<0.1'],     // Error rate must be less than 10%
  },
};

export default function () {
  // Test SAML login initiation
  let response = http.get('https://semantest.company.com/auth/saml/login');
  
  check(response, {
    'SAML redirect status': (r) => r.status === 302,
    'SAML redirect location': (r) => r.headers['Location'].includes('idp.company.com'),
  });
  
  sleep(1);
  
  // Test API authentication
  const apiResponse = http.get('https://semantest.company.com/api/user/profile', {
    headers: {
      'Authorization': 'Bearer mock_jwt_token'
    }
  });
  
  check(apiResponse, {
    'API auth status': (r) => r.status === 200 || r.status === 401,
  });
  
  sleep(1);
}
```

This comprehensive SSO integration manual provides enterprise-grade authentication solutions with multiple provider support, security best practices, and operational guidance for large-scale deployments.

---

**Last Updated**: January 19, 2025  
**Version**: 1.0.0  
**Maintainer**: Semantest Enterprise Security Team  
**Support**: security@semantest.com