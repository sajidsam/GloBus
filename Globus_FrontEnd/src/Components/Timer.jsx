import React, { useState, useEffect } from 'react';

const Timer = () => {
    const calculateTimeLeft = () => {
        const now = new Date();
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        const difference = endOfMonth - now;

        if (difference <= 0) return null;

        return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / (1000 * 60)) % 60),
            seconds: Math.floor((difference / 1000) % 60)
        };
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            const updatedTime = calculateTimeLeft();
            setTimeLeft(updatedTime);
            if (!updatedTime) clearInterval(timer);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    if (!timeLeft) return <div className="text-center text-xl font-bold p-4">Month End Deals are over!</div>;

    return (
        <>
            <div className='oswald text-4xl font-bold text-black flex text-center justify-center mt-5'>
                <h1 className=" dark:text-black text-white">Monthly Deals</h1>
            </div>

            <div className="text-center bg-red-600 text-white font-bold mt-5 p-3 rounded-lg w-80  mx-auto flex justify-around">

                <div className="bg-white text-red-600 rounded-lg px-3 py-2 flex flex-col items-center w-14">
                    <span className="text-xl">{timeLeft.days}</span>
                    <div className="text-sm">Days</div>
                </div>

                <div className="bg-white text-red-600 rounded-lg px-3 py-2 flex flex-col items-center w-14">
                    <span className="text-xl">{timeLeft.hours}</span>
                    <div className="text-sm">Hours</div>
                </div>

                <div className="bg-white text-red-600 rounded-lg px-3 py-2 flex flex-col items-center w-14">
                    <span className="text-xl">{timeLeft.minutes}</span>
                    <div className="text-sm">Min</div>
                </div>

                <div className="bg-white text-red-600 rounded-lg px-3 py-2 flex flex-col items-center w-14">
                    <span className="text-xl">{timeLeft.seconds}</span>
                    <div className="text-sm">Sec</div>
                </div>
            </div>
        </>

    );
};

export default Timer;
