// Global constants
// These are mainly used as general settings.

// User interaction
const MOUSE_PARTICLE_CHARGE = 10000;

// Particles
const NUMBER_OF_PARTICLES = 1000;
const PARTICLE_CHARGE = 3;
const PARTICLE_MASS = 5;
const PARTICLE_RADIUS = 3;
const PARTICLE_COLOR = "cyan";

// Canvas
const UNIVERSE_SIZE = 800;
const UNIVERSE_CENTER = new Complex(UNIVERSE_SIZE / 2, UNIVERSE_SIZE / 2);
const CANVAS_ID = "myCanvas";

// Boundry zone (area the particles bounce off of)
const BOUNDRY_RADIUS = (UNIVERSE_SIZE / 2) * 0.8;
const BOUNDRY_STROKE = 4;
const BOUNDRY_COLOR = "purple";

// Score zone (area where particles count towards score)
const SCOREZONE_RADIUS = (UNIVERSE_SIZE / 2) * 0.33;
const SCOREZONE_STROKE = 4;
const SCOREZONE_COLOR = "orange";

// Score counter
const SCORECOUNTER_FONT = "60px Arial";
const SCORECOUNTER_COLOR = SCOREZONE_COLOR;
const COUNTDOWN_DURATION_SECONDS = 4.0 * 0.75;
const GAME_DURATION_SECONDS = 7.0;

// Physics simulation
const PHYSICS_FPS = 60;
const DELTA_TIME_SECONDS = 1.0 / PHYSICS_FPS;
const GRAVITATIONAL_CONSTANT = 1.0;
const BOUNCE_DAMPENING = 1.0;
const FRICTION = 0.99;

// Precision and performance
const FLOAT_TOLERANCE = 1e-7;
const NUMBER_OF_TERMS = 5;
const QT_DEPTH = 3;

