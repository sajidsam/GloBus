import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faBolt, 
    faShieldAlt, 
    faLock, 
    faHeadset 
} from '@fortawesome/free-solid-svg-icons';

const PromotionCard = () => {
    const features = [
        { id: 1, icon: faBolt, title: "Instant Delivery", description: "1-2 hour express delivery.", status: "LIVE TRACKING" },
        { id: 2, icon: faShieldAlt, title: "Quality Certified", description: "100% authentic products.", status: "VERIFIED" },
        { id: 3, icon: faLock, title: "Secure Payment", description: "Bank-level encryption.", status: "ENCRYPTED" },
        { id: 4, icon: faHeadset, title: "24/7 Support", description: "Round-the-clock support.", status: "ONLINE NOW" }
    ];

    const [gridState, setGridState] = useState([
        [1, 2],
        [3, 4]
    ]);
    const [currentTitle, setCurrentTitle] = useState(1);
    const [isAnimating, setIsAnimating] = useState(false);

    const rotations = [
        { grid: [[1,2],[3,4]], title: 1 },
        { grid: [[2,4],[1,3]], title: 4 },
        { grid: [[4,3],[2,1]], title: 3 },
        { grid: [[3,1],[4,2]], title: 2 }
    ];

    const [rotationIndex, setRotationIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            handleRotate();
        }, 3000);

        return () => clearInterval(interval);
    }, [rotationIndex]);

    const handleRotate = () => {
        if (isAnimating) return;
        
        setIsAnimating(true);
        
        // Next rotation state
        const nextIndex = (rotationIndex + 1) % rotations.length;
        const nextRotation = rotations[nextIndex];
        
        // Update grid and title
        setGridState(nextRotation.grid);
        setCurrentTitle(nextRotation.title);
        
        setTimeout(() => {
            setRotationIndex(nextIndex);
            setIsAnimating(false);
        }, 1000);
    };

    const getFeatureById = (id) => {
        return features.find(f => f.id === id);
    };

    const getCurrentFeature = () => {
        return features.find(f => f.id === currentTitle);
    };

    return (
        <div className="max-w-md  flex flex-col items-center gap-8 p-6">
            {/* 2x2 Rubik's Grid */}
            <div className="relative w-64 h-64 grid grid-cols-2 grid-rows-2 gap-4 perspective-1000">
                {gridState.flat().map((featureId, index) => {
                    const feature = getFeatureById(featureId);
                    const row = Math.floor(index / 2);
                    const col = index % 2;
                    
                    return (
                        <div
                            key={`${featureId}-${row}-${col}`}
                            className={`bg-gradient-to-br from-red-600 to-red-700 rounded-2xl border-2 border-red-400 flex items-center justify-center transition-all duration-700 ease-in-out transform ${
                                isAnimating ? 'rotate-y-180' : ''
                            }`}
                        >
                            <FontAwesomeIcon 
                                icon={feature.icon} 
                                className="text-white text-2xl" 
                            />
                        </div>
                    );
                })}
            </div>

            {/* Title Display */}
            <div className="w-80 bg-white rounded-2xl p-6 shadow-2xl border border-gray-200 transform transition-all duration-500">
                <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                        {getCurrentFeature().title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                        {getCurrentFeature().description}
                    </p>
                    <div className="flex items-center justify-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-red-600 text-xs font-medium">
                            {getCurrentFeature().status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Rotation Indicator */}
            <div className="flex space-x-2">
                {rotations.map((_, index) => (
                    <div
                        key={index}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            rotationIndex === index 
                                ? 'bg-red-600 scale-125' 
                                : 'bg-gray-300'
                        }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default PromotionCard;