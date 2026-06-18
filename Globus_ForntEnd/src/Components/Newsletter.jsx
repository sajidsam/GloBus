import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';

const Newsletter = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        try {
            const response = await fetch('https://glo-bus-backend.vercel.app/api/newsletter/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (data.success) {
                setMessage('Successfully subscribed to our newsletter!');
                setEmail('');
            } else {
                setMessage(data.message || 'Something went wrong. Please try again.');
            }
        } catch (error) {
            console.error('Subscription error:', error);
            setMessage('Failed to subscribe. Please check your connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <div className="bg-gray-800 py-8 px-4 mt-40 relative">
            {/* Back to Top Button - Simple with FontAwesome */}
            <div className="absolute -top-24 left-1/2 transform -translate-x-1/2">
                <button 
                    onClick={scrollToTop}
                    className="bg-black text-white font-bold py-3 px-6 rounded-4xl hover:bg-gray-900 transition-all duration-300 shadow-lg hover:shadow-xl drop-shadow-2xl flex items-center gap-2"
                >
                    <FontAwesomeIcon icon={faArrowUp} />
                    Back 
                </button>
            </div>

            {/* Newsletter Content */}
            <div className="max-w-md mx-auto text-center">
                <h2 className="text-2xl font-bold text-white mb-4">
                    Subscribe to our newsletter
                </h2>
                
                {message && (
                    <div className={`mb-4 p-3 rounded-lg ${
                        message.includes('Successfully') 
                            ? 'bg-green-100 text-green-800 border border-green-300' 
                            : 'bg-red-100 text-red-800 border border-red-300'
                    }`}>
                        {message}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 rounded-lg text-black placeholder-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-200"
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200 whitespace-nowrap"
                    >
                        {isLoading ? 'Subscribing...' : 'Subscribe'}
                    </button>
                </form>
                
                <p className="text-gray-400 text-sm mt-4">
                    We respect your privacy. Unsubscribe at any time.
                </p>
            </div>
        </div>
    );
};

export default Newsletter;