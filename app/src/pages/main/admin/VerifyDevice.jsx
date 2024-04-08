import React, { useEffect, useState } from 'react';
import ReactLoading from 'react-loading'
import { fetchData } from './SetFormData';

const VerifyDevice = () => {

    const [roll, setRoll] = useState();
    const [Alert, setAlert] = useState();
    const [buttonText, setButtonText] = useState('Submit');
    const [isLoading, setIsLoading] = useState(false);

    const BASEURL = process.env.REACT_APP_BASEURL

    const handleSubmit = () => {

        if(!window.confirm("Are you sure?\n NOTE: This will erase previous face data.")){
            return ;
        }
        if (!roll) {
            setAlert("Email is required !")
            return ;
        } 
        setAlert();
        const url = `${BASEURL}/student/reset-face-data`
        const data={
            studentRoll:roll,
            
        }
        console.log(data)
        setIsLoading(true);
        fetchData(url,data)
        .then((res)=>{
            if(res){
                setButtonText('Success')

            }else{
                setAlert("Roll number not found!")
            }
            setIsLoading(false);
        })
        .catch((error)=>{
            setAlert("verification failed...")
            setIsLoading(false);
            // console.log('bad')
            console.log(error)
        })
    }

    useEffect(()=>{
        setButtonText("Submit")
    },[roll])

    // const handleDeviceChange = (e) => {
    //     setDevice(e.target.value)
    // }


    return (
        <div className='max-w-md w-11/12 lg:1/2 mx-auto mt-10 p-4 bg-gray-100 rounded-md flex flex-col items-center'>
            <p className='m-2 text-lg text-red-600'>{Alert}</p>
            <div className='flex flex-col w-full'>
                <label for="selectOption">Student Face Verification</label>
                {/* <select
                    id="selectOption"
                    name="verifyDevice"
                    className='mt-2 p-1'
                    onChange={handleDeviceChange}
                >

                    <option selected value="Mobile" >Mobile</option>
                    <option value="Laptop">Laptop</option>


                </select> */}
                <input
                    type="text"
                    value={roll}
                    onChange={(e) => setRoll(e.target.value)}
                    placeholder='Roll Number'
                    className='mt-4 rounded-sm p-1'


                />


            </div>

            <button
                className='mt-8 bg-green-500 w-24 p-1 text-white rounded-md'
                onClick={handleSubmit}
            >{buttonText}</button>

            <h1>You have to erase previous face data.</h1>
            <h1>NOTE: Make sure to verify right student.</h1>


            <div className='relative bottom-40'>
                {
                    isLoading && <ReactLoading type='spin' color='blue' />
                }
            </div>

        </div>
    );
};

export default VerifyDevice;