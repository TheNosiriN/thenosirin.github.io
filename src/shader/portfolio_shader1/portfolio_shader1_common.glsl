// Made by: TheNosiriN

//#define LOW_QUALITY // use this if you're having troubles
#define HIGH_QUALITY // for beefy machines

#define MARGIN //remove anoying margins
#define DOF
#define SHOW_LENS_FLARE
// #define SHOW_TREE
// #define SHOW_FROSTED_GLASS
#define ROCK_SLIME

#define R (iResolution.xy)
#define mR min(R.x,R.y)
#define saturate(x) clamp(x, 0.0, 1.0)
#define PI 3.1415972

#define PLANET_RADIUS 500.
#define MAX_DIST 100.0
#define MAX_CAM_ANGLE 25.0


#if defined(HIGH_QUALITY)
const float treeIter = 8.0;
const float groundIter = 4.0;
const float groundLOD = 0.0;
const float cutLOD = 1.0;

#elif defined(LOW_QUALITY)
const float treeIter = 6.0;
const float groundIter = 3.0;
const float groundLOD = 1.0;
const float cutLOD = 3.0;

#else
const float treeIter = 7.0;
const float groundIter = 3.0;
const float groundLOD = 0.0;
const float cutLOD = 2.0;
#endif


const vec2 margin = vec2(1.65, 2.4);
const vec3 light = normalize(vec3(0.9,0.5,-1));
const vec3 focusPoint = vec3(0,-10.,-30);

float dot2(vec3 p){ return dot(p,p); }



mat2 rotate(float angle){
	angle *= 3.142 / 180.0;
    float s = sin(angle), c = cos(angle);
    return mat2( c, -s, s, c );
}

float smin(float a, float b, float k){
    float h = max(k-abs(a-b), 0.0);
    return min(a, b) - h*h*h/(6.0*k*k);
}


float easeOutQuint(float x) {
    return 1.0 - pow(1.0 - x, 5.0);
}
float get_cam_movement(float time){
    return smoothstep(0.,1., sin(time*0.03 - 1.2)*.5+.5 );
}



// la,lb=semi axis, h=height, ra=corner
float ndot( in vec2 a, in vec2 b ) { return a.x*b.x - a.y*b.y; }
float sdRhombus(vec3 p, float la, float lb, float h, float ra)
{
    p = abs(p);
    vec2 b = vec2(la,lb);
    float f = clamp( (ndot(b,b-2.0*p.xz))/dot(b,b), -1.0, 1.0 );
	vec2 q = vec2(length(p.xz-0.5*b*vec2(1.0-f,1.0+f))*sign(p.x*b.y+p.z*b.x-b.x*b.y)-ra, p.y-h);
    return min(max(q.x,q.y),0.0) + length(max(q,0.0));
}


float sdOctahedron(vec3 p, float s)
{
    p = abs(p);
    float m = p.x + p.y + p.z - s;
    vec3 r = 3.0*p - m;

#if 1
    // filbs111's version
    vec3 o = min(r, 0.0);
    o = max(r*2.0 - o*3.0 + (o.x+o.y+o.z), 0.0);
    return length(p - s*o/(o.x+o.y+o.z));
#else
    // iq's version
	vec3 q;
         if( r.x < 0.0 ) q = p.xyz;
    else if( r.y < 0.0 ) q = p.yzx;
    else if( r.z < 0.0 ) q = p.zxy;
    else return m*0.57735027;
    float k = clamp(0.5*(q.z-q.y+s),0.0,s);
    return length(vec3(q.x,q.y-s+k,q.z-k));
#endif
}
