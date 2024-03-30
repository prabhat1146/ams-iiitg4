import React from 'react';
import Camera from './Webcam'

function StudentPhotoUpload(props) {
    return (
        <div>
            <Camera roll={props.studentData.studentRollNumber}/>
        </div>
    );
}

export default StudentPhotoUpload;