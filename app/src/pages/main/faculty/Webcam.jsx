import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import Webcam from 'react-webcam';
import { fetchData } from '../admin/SetFormData';

const videoConstraints = {
  facingMode: 'user',
  width: window.width,
  height: window.height
};

const BASEURL = process.env.REACT_APP_BASEURL
let isModelLoaded=false;

const Cam = (props) => {

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [currentDescriptor, setCurrentDescriptor] = useState([]);
  const [oldDescriptor, setOldDescriptor] = useState([]);
  const [ofm, setofm] = useState(null);
  let cd = [];
  let rd = [];

  const [studentData, setStudentData] = useState([])




  const [img, setImg] = useState(null);

  useEffect(() => {
    let isModelLoaded = false;
  
    const loadModelsAndDetectFaces = async () => {
      try {
        console.log('Loading...');
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models'),
          faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
        ]);
  
        console.log('Models loaded');
        isModelLoaded = true;
  
        if (studentData?.length > 0) {
          console.log('s', studentData);
          // Perform actions dependent on models and studentData here
        }
      } catch (error) {
        console.error('Error loading models:', error);
        // Handle error loading models, such as displaying an error message to the user
      }
    };
  
    loadModelsAndDetectFaces();
  
  }, [studentData]);
  

  useEffect(() => {
    console.log('p', props?.students)
    const desc = props?.students?.map((data) => {
      const label = data.roll;
      console.log('l', label)
      console.log('dl', data)
      let descriptors = null
      if (data?.desc) {
        descriptors = data?.desc.labeledDescriptors[0].descriptors

      }
      console.log('ds', descriptors, label)
      if (descriptors && descriptors.length > 0) {
        console.log('dds', descriptors, label)
        return new faceapi.LabeledFaceDescriptors(label, [new Float32Array(descriptors[0])]);
      }
    });

    // Filter out undefined elements and empty arrays before updating studentData
    const filteredDesc = desc.filter((item) => item !== undefined && item.descriptors.length > 0);
    console.log('f', filteredDesc)
    console.log('fd', desc)
    if (filteredDesc.length > 0) {
      setofm(new faceapi.FaceMatcher(filteredDesc))
    }

    // setStudentData((prev) => [...prev, ...filteredDesc]);


  }, [props])

  useEffect(() => {

    const detectFaces = async () => {
      if (webcamRef.current && webcamRef.current.video.readyState === 4) {
        const video = webcamRef.current.video
        // const video = document.getElementById('img')
        console.log("detecting...")
        // const detections = await faceapi.detectAllFaces(video, new faceapi.SsdMobilenetv1Options());
        const detections = await faceapi.detectAllFaces(video, new faceapi.SsdMobilenetv1Options()).withFaceLandmarks().withFaceDescriptors();
        // const detections = await faceapi.detectAllFaces(video, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.2 })).withFaceLandmarks().withFaceDescriptors();
        if (!detections || detections?.length < 1) {
          return
        }
        // const detectionsdd = await faceapi.detectAllFaces(video, new faceapi.SsdMobilenetv1Options()).withFaceLandmarks().withFaceDescriptors();
        const resizeDetections = faceapi.resizeResults(detections, { width: video.videoWidth, height: video.videoHeight });
        // const resizeDetectionsd = faceapi.resizeResults(detections, { width: video.videoWidth, height: video.videoHeight });

        const canvas = canvasRef.current;
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);


        faceapi.draw.drawDetections(canvasRef.current, resizeDetections);

        // const input = document.getElementById('img');
        // const imgd = await faceapi.detectSingleFace(input).withFaceLandmarks().withFaceDescriptor()
        if (detections?.length > 0) {
          // console.log(imgd)
          // ofm = new faceapi.FaceMatcher([new faceapi.LabeledFaceDescriptors('2101146',[imgd.descriptor])]);
          // Convert your descriptor to a Float32Array if it's not already in that format
          // const descriptorArray = new Float32Array(imgd);

          // // Create LabeledFaceDescriptors instance with the label '2101146' and the descriptor array
          // const labeledDescriptors = [
          //   new faceapi.LabeledFaceDescriptors('2101146', [descriptorArray])
          // ];

          // // Create a FaceMatcher instance
          // ofm = new faceapi.FaceMatcher(labeledDescriptors);



          // console.log('f', cfm)
          // console.log('d',detections)
          // console.log('dd',detectionsd)



          if (detections.length > 0) {
            let myfm;
            if (cd.length > 0) {
              myfm = new faceapi.FaceMatcher(cd);
            }
            detections?.forEach((d) => {
              if (cd.length === 0) {
                cd.push(d)
                console.log('first added')
                return;
              }
              if (!d) {

              }
              const bm = myfm?.findBestMatch(d?.descriptor)

              if (!(bm?.distance <= 0.62)) {
                // currentDescriptor.push(d)
                // setCurrentDescriptor((p)=>([...p,d]))
                cd.push(d)
                console.log('added to cd', cd)
                console.log('dist', bm?.distance)
                console.log('per', bm?.toString())
              }

            })
          }


          cd.forEach((d) => {
            console.log('dd', ofm)
            if (d && ofm) {
              // console.log('arr',d.descriptor)
              console.log('arrf', ofm.descriptor)
              const bm = ofm?.findBestMatch(d?.descriptor)
              console.log('t', bm.toString())
              console.log('roll', bm.label)
              ctx.fillText(bm.label, 10, 10)
              const tempdata = props.students?.find((data) => data.roll?.toString() === bm.label?.toString())
              console.log('td', tempdata)
              console.log('at', props.students[0])
              if (props.students[0].attendanceType === "ByCourseID") {
                setAttendanceByCourseID(tempdata?.email.toString(), tempdata?.roll.toString())
              } else if (props.students[0].attendanceType === "BySectionID") {
                setAttendanceBySectionID(tempdata?.email.toString(), tempdata?.roll.toString())
              } else if (props.students[0].attendanceType === "ByGroupID") {
                setAttendanceByGroupID(tempdata?.email.toString(), tempdata?.roll.toString())
              }


            }

          })


        }
      }
    };

    const intervalId = setInterval(detectFaces, 1000); // Adjust the interval as needed for performance

    return () => clearInterval(intervalId);
  }, [cd, ofm, props.students, webcamRef]);

  // const retake = () => {
  //   setImg(webcamRef.current.getScreenshot());

  //   // setCurrentDescriptor(['d'])
  //   // alert(currentDescriptor.lenght)
  // };

  const setAttendanceByCourseID = (email, roll) => {
    let url = `${BASEURL}/attendance/makeAttendanceBycourseID`
    if (!email || !roll) {
      console.log('email:', email, " roll", roll)
      console.log('email and roll are required!')
      return
    }
    let data = {
      courseID: props.data.courseID,
      timeSlot: props.data.timeSlot,
      date: props.data.date,
      // department: query.department,
      degree: props.data.degree,
      studentEmail: email,
      studentRollNo: roll
    }
    console.log('attendace marked')
    fetchData(url, data, `${roll} marked as present`, true)
  }
  const setAttendanceByGroupID = (email, roll) => {
    let url = `${BASEURL}/attendance/makeAttendanceBycourseID`
    if (!email || !roll) {
      console.log('email:', email, " roll", roll)
      console.log('email and roll are required!')
      return
    }
    let data = {
      courseID: props.data.courseID,
      timeSlot: props.data.timeSlot,
      date: props.data.date,
      // department: query.department,
      degree: props.data.degree,
      studentEmail: email,
      studentRollNo: roll,
      studentGroup: props.data.StudentGroup
    }
    console.log('attendace marked')
    fetchData(url, data, `${roll} marked as present`, true)
  }
  const setAttendanceBySectionID = (email, roll) => {
    let url = `${BASEURL}/attendance/makeAttendanceBycourseID`
    if (!email || !roll) {
      console.log('email:', email, " roll", roll)
      console.log('email and roll are required!')
      return
    }
    let data = {
      courseID: props.data.courseID,
      timeSlot: props.data.timeSlot,
      date: props.data.date,
      // department: query.department,
      degree: props.data.degree,
      studentEmail: email,
      studentRollNo: roll,
      studentSection: props.data.studentSection
    }
    console.log('attendace marked')
    fetchData(url, data, `${roll} marked as present`, true)
  }



  return (
    <div className='flex flex-row w-full'>
      <div className=' flex justify-center items-center w-11/12 bg-green-400 border border-2x relative'>

        <Webcam ref={webcamRef} video={true} audio={false} videoConstraints={videoConstraints} />
        <canvas className='absolute m-auto' ref={canvasRef}></canvas>
      </div>
      {/* <div className='flex flex-col w-2/5'>
        <div className='flex justify-center items-center'>
          <img id='img' src={img} alt="" />
          
        </div>
        <div className='flex justify-center'>
          <button onClick={retake} className=' mt-8 px-4 p-1 rounded-md bg-slate-500'>Retake</button>
        </div>
      </div> */}
    </div>
  );
};

export default Cam;
