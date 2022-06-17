import React from 'react';
import './App.css';
import Slider from '@mui/material/Slider';

export default function BrightnessSlider() {
    const [value, setValue] = React.useState(10);

    const handleBrightness = (event, newValue) => {
        setValue(newValue);
        console.log(newValue);
    };

    return (
        <Slider id="brightness-slider" aria-label="edit-magnitude" value={value} min={0} max={100} valueLabelDisplay="auto" onChange={handleBrightness}/>
    );
}
