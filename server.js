const express = require('express');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, orderBy, limit, getDocs } = require('firebase/firestore');
const cors = require('cors');
const path = require('path');

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAbBD0C0snw1G4bltcTbd8-4VdgfBXdC8c",
  authDomain: "deficcmsmobile.firebaseapp.com",
  projectId: "deficcmsmobile",
  storageBucket: "deficcmsmobile.firebasestorage.app",
  messagingSenderId: "118281980645",
  appId: "1:118281980645:web:334ce988320fe1c67d220c",
  measurementId: "G-NBF2XBFYGC"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint for version check
app.get('/latest-version-check', async (req, res) => {
  try {
    const buildNumber = parseInt(req.query.buildnumber, 10);
    
    if (isNaN(buildNumber)) {
      return res.status(400).json({ error: 'Invalid build number' });
    }
    
    // Query Firestore for the latest version (highest number)
    const versionsRef = collection(db, "ccms_versions");
    const q = query(versionsRef, orderBy("number", "desc"), limit(1));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return res.status(404).json({ error: 'No version information found' });
    }
    
    const latestVersion = querySnapshot.docs[0].data();
    const latestBuildNumber = latestVersion.number;
    
    if (buildNumber >= latestBuildNumber) {
      return res.json({ status: "already_latest" });
    } else {
      return res.json({
        status: "major_update_required",
        file: latestVersion.file
      });
    }
  } catch (error) {
    console.error("Error checking version:", error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
