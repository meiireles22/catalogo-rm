#!/bin/bash
cd frontend
npm install
REACT_APP_BACKEND_URL= npm run build
cd ../backend
pip install -r requirements.txt