export const getUserImageSrc = imagePath => {
    if(imagePath) {
        return {uri: imagePath}; 
    } else {
        return require('../assets/images/welcome1.png'); // Fallback image
    }
}