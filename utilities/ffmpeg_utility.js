const { exec } = require('child_process');
const Camera = require('../models/CameraModel');
const { randomUUID } = require('crypto');

// Function to execute a shell command and return a promise
const execPromise = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
};

// Function to scan for the camera name
const cameraScan = async () => {
  try {
    const { stderr } = await execPromise('ffmpeg -list_devices true -f dshow -i dummy');
    const cameraNameMatch = /\[dshow @ [^\]]+\] "(.*?)" \(video\)/.exec(stderr);
    if (cameraNameMatch) {
      const cameraName = cameraNameMatch[1];
      console.log(`Detected camera name: ${cameraName}`);
      return cameraName;
    } else {
      console.log('No camera detected.');
      return null;
    }
  } catch (error) {
    console.error(`Error executing FFmpeg: ${error.message}`);
    return null;
  }
};

const cameraOption = async (cameraName) => {
    if (!cameraName) {
      console.log('No camera name provided.');
      return;
    }
    try {
      const { stderr } = await execPromise(`ffmpeg -f dshow -list_options true -i video="${cameraName}"`);
  
      // Regular expression to match lines with vcodec or pixel_format details
      const regex = /^\[dshow @ [^\]]+\]\s+(vcodec=[^\s]+\s+min\s+s=\d+x\d+\s+fps=\d+\s+max\s+s=\d+x\d+\s+fps=\d+|pixel_format=[^\s]+\s+min\s+s=\d+x\d+\s+fps=\d+\s+max\s+s=\d+x\d+\s+fps=\d+)$/gm;
      const matches = stderr.match(regex);
      
      if (matches) {
        const extractedValues = matches.map(line => {
            // Remove the '[dshow @ ...]' part from the line
              const cleanedLine = line.replace(/^\[dshow @ [^\]]+\]\s+/, '');
    
            // Extract the values into an object
              const [key, value] = cleanedLine.split('  ', 2);
              const [min, max] = value.split(' max ', 2);
              const codec=key.replace('vcodec=', '').trim();
              const minDetails = min.replace('min ', '').trim();
              const option=minDetails.split(' ');
              console.log(min);
              const resolution=option[0].replace('s=','').trim();
              const fps=option[1].replace('fps=','').trim();
              
    
            return {
              id:randomUUID(),
              vcodec: codec,
              ip_Adrress: "localhost",
              resolution: resolution,
              fps: fps,
            };
        });
  
        return extractedValues;
      } else {
        console.log('No matching lines found.');
      }
    } catch (error) {
      console.error(`Error executing FFmpeg: ${error.message}`);
    }
  };
  
  

// Main function to run the scan and then get options
const cameraOptions = async (cameraName) => {
  
  if (cameraName) {
    const extractedValues= await cameraOption(cameraName);
   return  extractedValues
  }
  else return null;
};
module.exports = {cameraScan,cameraOptions};

