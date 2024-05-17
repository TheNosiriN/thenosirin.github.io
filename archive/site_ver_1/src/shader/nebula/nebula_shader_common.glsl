#define PI 3.1415972
#define R (iResolution.xy)
#define saturate(x) clamp(x, 0.0, 1.0)
#define MOD3 vec3(.1031,.11369,.13787)
#define TIME iTime


float hash13(vec3 p3)
{
	p3  = fract(p3 * .1031);
    p3 += dot(p3, p3.zyx + 31.32);
    return fract((p3.x + p3.y) * p3.z);
}

vec3 hash33(vec3 p3)
{
	p3 = fract(p3 * MOD3);
    p3 += dot(p3, p3.yxz+19.19);
    return -1.0 + 2.0 * fract(vec3((p3.x + p3.y)*p3.z, (p3.x+p3.z)*p3.y, (p3.y+p3.z)*p3.x));
}
float perlin_noise(vec3 p)
{
    vec3 pi = floor(p);
    vec3 pf = p - pi;

    vec3 w = pf * pf * (3.0 - 2.0 * pf);

    return 	mix(
        		mix(
                	mix(dot(pf - vec3(0, 0, 0), hash33(pi + vec3(0, 0, 0))),
                        dot(pf - vec3(1, 0, 0), hash33(pi + vec3(1, 0, 0))),
                       	w.x),
                	mix(dot(pf - vec3(0, 0, 1), hash33(pi + vec3(0, 0, 1))),
                        dot(pf - vec3(1, 0, 1), hash33(pi + vec3(1, 0, 1))),
                       	w.x),
                	w.z),
        		mix(
                    mix(dot(pf - vec3(0, 1, 0), hash33(pi + vec3(0, 1, 0))),
                        dot(pf - vec3(1, 1, 0), hash33(pi + vec3(1, 1, 0))),
                       	w.x),
                   	mix(dot(pf - vec3(0, 1, 1), hash33(pi + vec3(0, 1, 1))),
                        dot(pf - vec3(1, 1, 1), hash33(pi + vec3(1, 1, 1))),
                       	w.x),
                	w.z),
    			w.y);
}


vec3 hue_to_rgb(float hue)
{
    float r = abs(hue * 6.0 - 3.0) - 1.0;
    float g = 2.0 - abs(hue * 6.0 - 2.0);
    float b = 2.0 - abs(hue * 6.0 - 4.0);
    return saturate(vec3(r,g,b));
}
vec3 hsv_to_rgb(vec3 hsv)
{
    vec3 rgb = hue_to_rgb(hsv.x);
    return ((rgb - 1.0) * hsv.y + 1.0) * hsv.z;
}

float easeInExpo(float x, float e) {
    return x == 0. ? 0. : pow(e, 10. * x - 10.);
}

float remap(float v, float oldmn, float oldmx, float newmn, float newmx){
    return ((v - oldmn) * (newmx - newmn)) / (oldmx - oldmn) + newmn;
}

vec3 ACESFilm(vec3 x)
{
    float a = 2.51;
    float b = 0.03; float c = 2.43;
    float d = 0.59; float e = 0.14;
    return (x*(a*x+b))/(x*(c*x+d)+e);
}
