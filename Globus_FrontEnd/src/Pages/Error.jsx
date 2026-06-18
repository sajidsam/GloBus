import React from 'react';

const Error = () => {
    return (
        <div className="flex flex-col items-center justify-center w-screen h-screen bg-white">
            <img
                src="/Images/ErrorPage/errorPage.png"
                alt="Error Page"
                className="mb-6" 
            />
            <h1 className='text-6xl font-bold'>
                 --X-- Page Not Found --X--
            </h1>
        </div>
    );
};

export default Error;
