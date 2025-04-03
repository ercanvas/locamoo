export type City = {
    name: string;
    coords: [number, number]; // [longitude, latitude]
};

export const majorCities: City[] = [
    { name: "London", coords: [-0.1276, 51.5074] },
    { name: "Paris", coords: [2.3522, 48.8566] },
    { name: "Berlin", coords: [13.4050, 52.5200] },
    { name: "Madrid", coords: [-3.7038, 40.4168] },
    { name: "Rome", coords: [12.4964, 41.9028] },
    { name: "Istanbul", coords: [28.9784, 41.0082] },
    { name: "Moscow", coords: [37.6173, 55.7558] },
    { name: "Vienna", coords: [16.3738, 48.2082] },
    { name: "Amsterdam", coords: [4.9041, 52.3676] },
    { name: "Prague", coords: [14.4378, 50.0755] },
];

export function getRandomCityPair(): [City, City] {
    const firstIndex = Math.floor(Math.random() * majorCities.length);
    let secondIndex;
    do {
        secondIndex = Math.floor(Math.random() * majorCities.length);
    } while (secondIndex === firstIndex);

    return [majorCities[firstIndex], majorCities[secondIndex]];
}
