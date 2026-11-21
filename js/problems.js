// Zbiór testowy: 12 równań + 22 zadania z fizyki.
// Zadania są po angielsku, bo modele 135M-1.5B słabo radzą sobie z polskim.
// pick: którego pierwiastka szukamy, gdy równanie ma ich kilka.

export const PROBLEMS = [
  // --- równania ---
  { id: 'e1', cat: 'equation', q: 'Solve for x: 5x + 12 = 47', a: 7, pick: 'any' },
  { id: 'e2', cat: 'equation', q: 'Solve for x: 2(x - 3) = 3x - 14', a: 8, pick: 'any' },
  { id: 'e3', cat: 'equation', q: 'Solve for x: x/4 + 3 = 9', a: 24, pick: 'any' },
  { id: 'e4', cat: 'equation', q: 'Find the positive solution of x^2 - 5x - 14 = 0', a: 7, pick: 'pos' },
  { id: 'e5', cat: 'equation', q: 'Find the larger solution of x^2 - 9x + 20 = 0', a: 5, pick: 'max' },
  { id: 'e6', cat: 'equation', q: 'Solve for x: 2^x = 64', a: 6, pick: 'any' },
  { id: 'e7', cat: 'equation', q: 'Solve for x > 0: 3x^2 = 108', a: 6, pick: 'pos' },
  { id: 'e8', cat: 'equation', q: 'Solve for x: sqrt(x + 7) = 5', a: 18, pick: 'any' },
  { id: 'e9', cat: 'equation', q: 'Solve for x: 7x - 4 = 3x + 18', a: 5.5, pick: 'any' },
  { id: 'e10', cat: 'equation', q: 'Solve for x: (x + 2)/(x - 1) = 4', a: 2, pick: 'any' },
  { id: 'e11', cat: 'equation', q: 'Solve for x: 10^x = 0.001', a: -3, pick: 'any' },
  { id: 'e12', cat: 'equation', q: 'Find the positive solution of x^3 = 2x^2 + 15x', a: 5, pick: 'pos' },

  // --- fizyka ---
  { id: 'p1', cat: 'physics', q: 'A ball is dropped from rest from a height of 45 m. Using g = 9.81 m/s^2, how many seconds does it take to hit the ground?', a: 3.028912, pick: 'pos' },
  { id: 'p2', cat: 'physics', q: 'A car travels 240 km in 3 hours at constant speed. What is its speed in km/h?', a: 80, pick: 'pos' },
  { id: 'p3', cat: 'physics', q: 'A 1500 kg car accelerates at 2.4 m/s^2. What net force in newtons acts on it?', a: 3600, pick: 'pos' },
  { id: 'p4', cat: 'physics', q: 'A 12 V battery drives a current of 0.4 A through a resistor. What is the resistance in ohms?', a: 30, pick: 'pos' },
  { id: 'p5', cat: 'physics', q: 'A spring with spring constant 200 N/m is stretched until it stores 4 J of elastic energy. By how many meters is it stretched?', a: 0.2, pick: 'pos' },
  { id: 'p6', cat: 'physics', q: 'A 5 kg box is lifted so that its potential energy increases by 980 J. Using g = 9.8 m/s^2, how many meters was it lifted?', a: 20, pick: 'pos' },
  { id: 'p7', cat: 'physics', q: 'A train starts from rest and reaches 30 m/s in 12 s with constant acceleration. What is the acceleration in m/s^2?', a: 2.5, pick: 'pos' },
  { id: 'p8', cat: 'physics', q: 'A ball is thrown straight up at 20 m/s. Using g = 9.81 m/s^2, after how many seconds does it reach its highest point?', a: 2.038736, pick: 'pos' },
  { id: 'p9', cat: 'physics', q: 'A 0.2 kg ball has 10 J of kinetic energy. What is its speed in m/s?', a: 10, pick: 'pos' },
  { id: 'p10', cat: 'physics', q: 'A 6 ohm resistor and an unknown resistor are connected in parallel. The total resistance is 4 ohm. What is the resistance of the unknown resistor in ohms?', a: 12, pick: 'pos' },
  { id: 'p11', cat: 'physics', q: 'A sound wave has a frequency of 50 Hz and travels at 340 m/s. What is its wavelength in meters?', a: 6.8, pick: 'pos' },
  { id: 'p12', cat: 'physics', q: 'A motor does 6000 J of work in 2 minutes. What is its average power in watts?', a: 50, pick: 'pos' },
  { id: 'p13', cat: 'physics', q: 'A simple pendulum has a period of 2 s. Using g = 9.81 m/s^2 and T = 2*pi*sqrt(L/g), what is its length L in meters?', a: 0.993966, pick: 'pos' },
  { id: 'p14', cat: 'physics', q: 'A car moving at 25 m/s brakes with a constant deceleration of 5 m/s^2. What distance in meters does it need to stop?', a: 62.5, pick: 'pos' },
  { id: 'p15', cat: 'physics', q: 'An object of mass 4 kg has a momentum of 18 kg*m/s. What is its speed in m/s?', a: 4.5, pick: 'pos' },
  { id: 'p16', cat: 'physics', q: 'How much heat in joules is needed to warm 2 kg of water by 15 degrees Celsius? The specific heat of water is 4186 J/(kg*K).', a: 125580, pick: 'pos' },
  { id: 'p17', cat: 'physics', q: 'A stone is thrown horizontally at 15 m/s from the top of a cliff 20 m high. Using g = 9.81 m/s^2, how far from the base of the cliff, in meters, does it land?', a: 30.289936, pick: 'pos' },
  { id: 'p18', cat: 'physics', q: 'A gas at constant temperature has a volume of 6 L at a pressure of 2 atm. What is its volume in liters at 3 atm?', a: 4, pick: 'pos' },
  { id: 'p19', cat: 'physics', q: 'A car accelerates uniformly from 10 m/s to 30 m/s over a distance of 200 m. What is its acceleration in m/s^2?', a: 2, pick: 'pos' },
  { id: 'p20', cat: 'physics', q: 'A 60 W light bulb uses 1.5 kWh of energy. For how many hours was it on?', a: 25, pick: 'pos' },
  { id: 'p21', cat: 'physics', q: 'A cyclist rides the first 30 km at 15 km/h and the next 30 km at 30 km/h. What is the average speed for the whole trip in km/h?', a: 20, pick: 'pos' },
  { id: 'p22', cat: 'physics', q: 'Light passes from air (refractive index 1.0) into glass with refractive index 1.5. The angle of incidence is 30 degrees. What is the angle of refraction in degrees?', a: 19.471221, pick: 'pos' },
];

// Wzorcowe równania (do testu solvera: "wyrocznia" musi mieć 100%).
export const ORACLE = {
  e1: '5*x + 12 = 47', e2: '2*(x - 3) = 3*x - 14', e3: 'x/4 + 3 = 9', e4: 'x^2 - 5*x - 14 = 0',
  e5: 'x^2 - 9*x + 20 = 0', e6: '2^x = 64', e7: '3*x^2 = 108', e8: 'sqrt(x + 7) = 5',
  e9: '7*x - 4 = 3*x + 18', e10: '(x + 2)/(x - 1) = 4', e11: '10^x = 0.001', e12: 'x^3 = 2*x^2 + 15*x',
  p1: '0.5*9.81*x^2 = 45', p2: 'x*3 = 240', p3: 'x = 1500*2.4', p4: '12 = 0.4*x', p5: '0.5*200*x^2 = 4',
  p6: '5*9.8*x = 980', p7: '30 = x*12', p8: '20 - 9.81*x = 0', p9: '0.5*0.2*x^2 = 10', p10: '1/6 + 1/x = 1/4',
  p11: '340 = 50*x', p12: 'x*120 = 6000', p13: '2 = 2*pi*sqrt(x/9.81)', p14: '25^2 = 2*5*x', p15: '4*x = 18',
  p16: 'x = 2*4186*15', p17: '20 = 0.5*9.81*(x/15)^2', p18: '2*6 = 3*x', p19: '30^2 = 10^2 + 2*x*200',
  p20: '60*x = 1500', p21: 'x = 60/(30/15 + 30/30)', p22: '1.0*sin(30*pi/180) = 1.5*sin(x*pi/180)',
};
