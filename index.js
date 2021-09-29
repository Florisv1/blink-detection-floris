import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';

const loadModel = async () => {
  await tf.setBackend('webgl');

  model = await faceLandmarksDetection.load(
    faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
    { maxFaces: 1 }
  );
};

const thresholdValue = {
  // NOTE: Values derived based on samples at different focal lengths. Need to verify this on different devices.
  left: { angle: -0.986, y: 12.363 },
  right: { angle: -1.0555, y: 10.3 },
};

const setUpCamera = async (videoElement, webcamId = undefined) => {
  video = videoElement;
  const mediaDevices = await navigator.mediaDevices.enumerateDevices();

  const defaultWebcam = mediaDevices.find(
    (device) =>
      device.kind === 'videoinput' && device.label.includes('Built-in')
  );

  const cameraId = defaultWebcam ? defaultWebcam.deviceId : webcamId;

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facingMode: 'user',
      deviceId: cameraId,
      width: VIDEO_SIZE,
      height: VIDEO_SIZE,
    },
  });

  video.srcObject = stream;
  video.play();
  video.width = 500;
  video.height = 500;

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
};

let model, video;
const VIDEO_SIZE = 500;

let event;

function getThreshold(dir, irisZ) {
  return thresholdValue[dir]['angle'] * irisZ + thresholdValue[dir]['y'];
}

async function renderPrediction() {
  const predictions = await model.estimateFaces({
    input: video,
    returnTensors: false,
    flipHorizontal: true,
    predictIrises: true,
  });

  // STEP: Detect a simple blink first
  if (predictions.length > 0) {
    predictions.forEach((prediction) => {
      // NOTE: Iris position did not work as the diff remains almost same, so trying 0th upper and lower eyes
      // NOTE: Error in docs, rightEyeLower0 is mapped to rightEyeUpper0 and vice-versa
      // NOTE: taking center point for now, can add more points for accuracy(mabye)
      let rightLowerEyePoint = prediction.annotations.rightEyeUpper0[3];
      let rightUpperEyePoint = prediction.annotations.rightEyeLower0[4];

      let leftLowerEyePoint = prediction.annotations.leftEyeUpper0[3];
      let leftUpperEyePoint = prediction.annotations.leftEyeLower0[4];

      let rightDy = rightUpperEyePoint[1] - rightLowerEyePoint[1];
      let leftDy = leftUpperEyePoint[1] - leftLowerEyePoint[1];

      let rightIrisZ = prediction.annotations.rightEyeIris[0][2];
      let leftIrisZ = prediction.annotations.leftEyeIris[0][2];

      let rightClosed = rightDy <= getThreshold('right', rightIrisZ);
      let leftClosed = leftDy <= getThreshold('left', leftIrisZ);

      event = {
        left: leftClosed,
        right: rightClosed,
        wink: leftClosed || rightClosed,
        blink: leftClosed && rightClosed,
      };
    });
  }
  return event;
}

const blink = {
  loadModel: loadModel,
  setUpCamera: setUpCamera,
  getBlinkPrediction: renderPrediction,
  // For testing purpose only
  // testBucket: getTestBucket(),
};

export default blink;
