# Blink Detection

Use machine learning in JavaScript to detect a blink and build blink-controlled experiences!

## Demo

Visit [https://blink-detection.vercel.app](https://blink-detection.vercel.app) _(Works on mobile too!!)_

<!-- ![](blink-demo.gif) -->

Uses Tensorflow.js's [face landmark detection model](https://www.npmjs.com/package/@tensorflow-models/face-landmarks-detection).

## Detection

This tool detects when the user blinks. It can also detect a wink and separate eye blinks as well.

## How to use

## Installation

Via script tags:

```html
<!-- Require the peer dependencies of face-landmarks-detection. -->
<script src="https://unpkg.com/@tensorflow/tfjs-core@2.4.0/dist/tf-core.js"></script>
<script src="https://unpkg.com/@tensorflow/tfjs-converter@2.4.0/dist/tf-converter.js"></script>

<!-- You must explicitly require a TF.js backend if you're not using the tfjs union bundle. -->
<script src="https://unpkg.com/@tensorflow/tfjs-backend-webgl@2.4.0/dist/tf-backend-webgl.js"></script>
<!-- Alternatively you can use the WASM backend: <script src="https://unpkg.com/@tensorflow/tfjs-backend-wasm@2.4.0/dist/tf-backend-wasm.js"></script> -->

<!-- Require face-landmarks-detection -->
<script src="https://unpkg.com/@tensorflow-models/face-landmarks-detection@0.0.1/dist/face-landmarks-detection.js"></script>

<!-- Require blink-detection package itselg -->
<script src="https://unpkg.com/blink-detection@1.0.3/dist/index.js"></script>
```

Via npm:

Using `yarn`:

    $ yarn add blink-detection

    $ yarn add @tensorflow-models/face-landmarks-detection@0.0.1

    $ yarn add @tensorflow/tfjs-core@2.4.0, @tensorflow/tfjs-converter@2.4.0
    $ yarn add @tensorflow/tfjs-backend-webgl@2.4.0 # or @tensorflow/tfjs-backend-wasm@2.4.0

### Code sample

Start by importing it:

```js
import blink from 'blink-detection';
```

Load the machine learning model:

```js
await blink.loadModel();
```

Then, set up the camera feed needed for the detection. The `setUpCamera` method needs a `video` HTML element and, optionally, a camera device ID if you are using more than the default webcam.

```js
const videoElement = document.querySelector('video');

const init = async () => {
  // Using the default webcam
  await gaze.setUpCamera(videoElement);

  // Or, using more camera input devices
  const mediaDevices = await navigator.mediaDevices.enumerateDevices();
  const camera = mediaDevices.find(
    (device) =>
      device.kind === 'videoinput' &&
      device.label.includes(/* The label from the list of available devices*/)
  );

  await gaze.setUpCamera(videoElement, camera.deviceId);
};
```

Run the predictions:

```js
const predict = async () => {
  const blinkPrediction = await blink.getBlinkPrediction();
  console.log('Blink: ', blinkPrediction); // will return an object with values blink, wink, left, right indicating the state

  if (blinkPrediction.blink) {
    // do something when the user blinks
  }
  let raf = requestAnimationFrame(predict);
};
predict();
```

Stop the detection:

```js
cancelAnimationFrame(raf);
```
