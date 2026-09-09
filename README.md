# Cybershield-SIH
# Secure Digital Document Management System (SIH26190)

**Team Name:** Cybershield  
**Theme:** Blockchain & Cybersecurity  
**Problem Statement:** Secure Digital Document Management System for Legal and Investigation Documents  


 📌 Project Overview
Digital legal documents and evidence files stored on traditional servers are vulnerable to unauthorized editing and deletion. 
This project builds a tamper-proof digital locker using **Blockchain** technology. 

When a user uploads a PDF, the system generates its **SHA-256 digital fingerprint**, locks the fingerprint onto an immutable **Polygon Smart Contract**, and stores the encrypted file safely on **IPFS**. 
An interactive verification portal allows anyone to check whether a document is authentic (**GREEN: VERIFIED**) or has been altered (**RED: TAMPERED**).

1. What is the Project? (The Core Idea)
Imagine a court case where a digital PDF file (a police report or evidence document) is stored on a normal office computer. Anyone with basic skills could open that PDF, secretly change a date or a name, save it, and nobody would ever know it was changed.
Your project is to build a "Digital Locker" (a website) that catches cheaters instantly.
When a police officer or lawyer uploads a document into your system:
The website generates a unique digital fingerprint (a string of letters and numbers) for that exact file.
The website saves that fingerprint permanently into a Blockchain (a public ledger that no one can ever edit or erase).
If anyone edits even one single letter in that PDF later and re-uploads it, its fingerprint will completely change! Your website will compare the new fingerprint with the one stored on the Blockchain and flash a huge RED WARNING: TAMPERED FILE.

2. What Do You Have to Do?
You have to build one complete working website that has two main pages:
Page 1 (Upload Page): Where a user uploads a PDF. The website calculates its fingerprint, saves the fingerprint to the blockchain, and stores the encrypted PDF safely.
Page 2 (Verify Page): Where anyone can drag and drop a PDF file to check if it's original. If it matches the blockchain fingerprint, it shows GREEN: VERIFIED. If it was edited, it shows RED: TAMPERED.

3. Why Are You Doing This?
Real-world Problem: Legal and police documents are constantly manipulated in court cases because normal computer files are easy to edit without leaving a trace.
The Hackathon Goal: Smart India Hackathon judges want to see if your team can use Blockchain to stop evidence tampering.



 Team Roles & Responsibilities
 --Captain: [devanshi vaghela ]
Role:** Team Director, GitHub Manager & Pitch Presenter

What you do: You don't get stuck writing complex code. You act as the Director & Presenter.
Where you do it: On your laptop (using PowerPoint / Google Slides) and managing your team's code on GitHub (a website used to share code folders).
Step-by-step guideline:
Go to GitHub.com, create a free account, create a new project folder (called a "Repository"), and invite your 5 members to it.
Tell Member 3 (Backend) to create 3 empty sub-folders on their laptop: /contracts, /backend, and /frontend.
Every 4 hours, ask each member: "Show me what you built so far."
Build the official 6-Slide SIH Presentation using PowerPoint (Problem → Solution → System Architecture → Technology Used).
During judging, you give the 3-minute pitch to the judges and hand over technical questions to your teammates.


 --Member 2: [purvam patel]
 Role:** Blockchain & Smart Contract Specialist
  
What they do: Write the smart code that locks fingerprints onto the blockchain.
Where they do it: In VS Code inside the /contracts folder.
Step-by-step guideline:
Open VS Code and install the Solidity extension.
Write a short smart contract file (DocumentRegistry.sol).
Create two functions inside it:
addDocument() → Takes a document fingerprint and saves it to the blockchain.
verifyDocument() → Checks if a fingerprint exists on the blockchain.
Deploy this code to a free test blockchain network (like Polygon Amoy) using free test coins.
Copy the deployed Contract Address and hand it to Member 3.

 --Member 3: [siddharth trivedi]
Role:** Backend & API Engineer (The Bridge)
  
What they do: Build the server that links Member 4's web pages to Member 2's blockchain code.
Where they do it: In VS Code inside the /backend folder using Node.js.
Step-by-step guideline:
Open VS Code terminal in /backend and install Node packages (npm install express ethers cors).
Create a file called server.js.
Write two web addresses (APIs):
POST /api/upload: Receives the document from Member 4, calls Member 5's tool to get the fingerprint, and sends it to Member 2's blockchain address.
POST /api/verify: Receives a PDF from Member 4, gets its new fingerprint, and asks the blockchain if it matches.

 --Member 4: [yugshah]
 Role:** Frontend Developer & UI/UX Designer
  
What they do: Design the website screens that the judges will actually see and click on.
Where they do it: In VS Code inside the /frontend folder using React or simple HTML/CSS.
Step-by-step guideline:
Build a clean, professional web page with a top navigation bar.
Create an Upload Section: A box where users can drop a PDF, type a title, and click a big "Lock to Blockchain" button.
Create a Verify Section: A box where users drop a PDF to test it.
Design a big Green Banner ("VERIFIED") and a big Red Banner ("TAMPERED").
Connect the buttons to Member 3’s server URLs (http://localhost:5000/api/upload).



--Member 5: [mahi shah]
Role:** Security & File Storage Specialist
  
What they do: Create the tool that calculates file fingerprints and saves the encrypted PDFs.
Where they do it: In VS Code inside the /backend folder.
Step-by-step guideline:
Write a small JavaScript script using Node.js's built-in crypto library.
Make a function that takes a PDF file buffer and turns it into a 64-character SHA-256 fingerprint string (e.g., a8f5f1...).
Create a free account on Pinata.cloud (a free cloud storage tool for IPFS).
Write a function that sends the encrypted PDF to Pinata and returns a storage link.
Hand these functions to Member 3 so they can plug them into the main server.

 --Member 6: [vishwa and me ]
Role:** Document Processing, Quality Assurance & Testing
  
What they do: Prepare test files, extract text for previews, and test for bugs.
Where they do it: On their laptop using a PDF editor and web browser.
Step-by-step guideline:
Install tesseract.js or pdf-parse in the backend so uploaded PDFs can show a quick text preview on Member 4's web page.
Create Test File 1 (Original_Evidence.pdf): A dummy police report.
Create Test File 2 (Tampered_Evidence.pdf): Take File 1, open it in Adobe Acrobat or Word, change one single date or letter, and save it.
Upload File 1 to the website → Confirm it turns GREEN.
Upload File 2 to the website → Confirm it turns RED.

Step 1: Member 5 gives their Fingerprint function to Member 3.
Step 2: Member 2 gives their deployed Blockchain Address to Member 3.
Step 3: Member 3 links the Fingerprint function + Blockchain Address inside server.js.
Step 4: Member 4 connects the web forms to Member 3's server address (http://localhost:5000).
Step 5 (Verification): You (the Captain) sit down with Member 6, upload Original.pdf and Tampered.pdf, and confirm the website correctly shows Green and Red badges!
