# AI Image Enhacner (IOS Application)

**Project Statement:**
To develop an IOS application which allows the use of Artificial Intelligence to upscale images.

**Example execution of the prototype application**
<video src="https://raw.githubusercontent.com/TanzeelN/Ai-Image-Upscaler/main/assets/videos/Demo.mp4" width="320" height="240" controls></video>



**Example Images Enahnced**



**Project Requirements**
- A user friendly input/output image stream from a IOS phone.
- A selection of various models to upscale the image chosen.
- An API which contains image enhancing models that allows server-side exection.
- Use of AWS (Lambda Functions, S3 & DynamoDB) for easy & scalable transfer of images between the user & the API
- Image deletion after process completed for data privacy.

**Previous Challenges & Changes**
When first creating this application, the idea was to use an E3 AWS server which would:  
- Store the image
- Have a prebuilt model which would upscale the image
- Send the output back to the user
- Execute a cleanup task.  

This was not feasible due to the computation power required by AI Models causing scalability issues & it would have been extremely pricey.
Instead, using Lambda Functions,S3 buckets & DynamoDB, a secure url link was created when an image was sent to make the transfer of the data fast. Furthermore, with a use of an API (Replicate) which, specialises in server side exection of artificial intelligence models, the process of upscaling is quicker & considerably cheaper.

This approach allowed for enahnced security with communication between the user & the server as well as a more efficient pipeline which could be scalable.


**Tech Stack Used:**
- React-Native (Front End): A javascript mobile app framework compatible with IOS application.
    - Takes image & model selectio as input.
    - Sends request to back end for an url to send an image to.
    - Receives an input back of the upscaled image, providing functionality to compare it to the original.

- Python (Back End): Python was used to allow the transfer of images & sending requests to the API.
    - Receives a request from the application for a presigned url. Generates the URL & sends it back to the application.
    - Notices the application has sent the image to the S3 Bucket & sends a request for the Replicate API to upscale the image.
    - Stores the request sent in DyanmoDB for tracking awaiting for the upscaled image.
    - Once the upscaled image has been received, send it back to the IOS application.

**Additional resources used:**

AWS: Using Lambda, S3 & Dyanmo DB allows the application to be available 24/7 with cheap upkeep & possible scalability.
Replicate API: Well known API which has repository of Artifical Intellgence models.
Postman: Test if API calls/cloud interaction is working as expected.


**Conclusion**
This application was successfully built as a protype version. All functionalities are in working order but do require aesthetic improvements. One key challenge was that react-native consistently receive patch updates. This at periods caused errors in the code meaning syntax had to be consistently updated.

**Improvements**
- Formatting & Aesthetics improvements of the front end application.
- Thoughts about security & encryption to make this a viable live app.
- AWS is effective for allowing scalability but using replicate API has limitations.
