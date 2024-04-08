import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import Webcam from 'react-webcam';
import { fetchData } from '../admin/SetFormData';

const videoConstraints = {
    facingMode: 'user',
    width: window.outerWidth,
    height: window.outerHeight
};

const BASEURL = process.env.REACT_APP_BASEURL
let isModelLoaded = false;

const Cam = (props) => {
    const webcamRef = useRef(null);
    const [desc, setDesc] = useState(null);
    const [img, setImg] = useState(null);
    const [Alert, setAlert] = useState('');
    const [buttonText,setButtonText]=useState("Capture");



    useEffect(() => {
        const loadModelsAndDetectFaces = async () => {
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
                faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
                faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
                faceapi.nets.faceExpressionNet.loadFromUri('/models'),
                faceapi.nets.ssdMobilenetv1?.loadFromUri('/models')
            ]);

            console.log('Models loaded');
            isModelLoaded = true;
        };

        loadModelsAndDetectFaces();
    }, []);

    const retake = async () => {
        setButtonText("Retake")
        setAlert();
        console.log("retake")

        if (!window.confirm("Are you sure to upload? \n Changes will not revert.")) {
            return
        }
        setAlert()
        const screenshot = webcamRef.current.getScreenshot();
        setImg(screenshot);

        const imgElement = document.createElement('img');
        imgElement.onload = async () => {
            if (webcamRef.current && isModelLoaded) {
                let imgd = null;
                try {
                    await Promise.all([imgd = await faceapi?.detectSingleFace(imgElement)?.withFaceLandmarks()?.withFaceDescriptor()]);
                    imgd.then((res) => {

                    })
                        .catch((error) => {
                            console.log(error)
                        })
                } catch (error) {
                    console.log(error)
                }
                console.log('i', imgd);

                if (imgd && props.roll) {
                    const labelFaceMatcher = new faceapi.FaceMatcher([new faceapi.LabeledFaceDescriptors(props.roll, [imgd.descriptor])]);
                    setDesc(labelFaceMatcher);
                    console.log(labelFaceMatcher);

                    if (labelFaceMatcher) {
                        const url = `${BASEURL}/student/verify-face-data`
                        const data = {
                            studentRoll: props.roll,
                            desc: labelFaceMatcher
                        }

                        fetchData(url, data)
                            .then((res) => {
                                if (res) {
                                    setAlert("Success")
                                } else {
                                    setAlert("Error while uploading...")
                                }
                            })
                    }
                } else {
                    setAlert("Face not detected, not clear, or low light")
                }
            }else{
                setAlert("You are not connected to Internet.");
            }
        };
        imgElement.src = screenshot;
    };




    return (
        <div className='flex flex-col md:flex-row lg:flex-row w-full mt-8'>
            <div className='m-1 flex justify-center items-center w-full md:w-4/5 lg:w-4/5 bg-green-400 border border-2x relative'>
                <Webcam ref={webcamRef} video={true} audio={false} videoConstraints={videoConstraints} />
            </div>
            <div className='flex flex-col w-full md:w-2/5 lg:w-2/5 mx-1'>
                <div className='flex justify-center items-center'>
                    <img id='img1' src={img} alt="" />
                </div>
                <div className=' mt-2 flex justify-center items-center text-white'>
                    <h1>{Alert}</h1>
                </div>
                <div className='flex justify-center'>
                    <button onClick={retake} className='mt-4 m-1 px-4 p-1 text-white rounded-md bg-green-400 hover:bg-green-600'>{buttonText}</button>
                    {/* <button onClick={upload} className='mt-4 m-1 px-4 p-1 text-white rounded-md bg-green-400 hover:bg-green-600'>Upload</button> */}
                </div>
            </div>
        </div>
    );
};

export default Cam;
