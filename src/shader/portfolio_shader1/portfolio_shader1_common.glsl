// Made by: TheNosiriN

precision mediump float;
precision mediump int;
precision lowp sampler3D;

//#define LOW_QUALITY // use this if you're having troubles
#define HIGH_QUALITY // for beefy machines

#define MARGIN //remove anoying margins
#define DOF
#define SHOW_LENS_FLARE
// #define SHOW_TREE
// #define SHOW_FROSTED_GLASS
#define ROCK_SLIME
#define PULSE

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
const vec3 light = vec3(0.6270598, 0.3483665, -0.6967331);
const vec3 focusPoint = vec3(0,-10.,-30);

float dot2(in highp vec3 p_1)
{
    float tmpvar_2;
    tmpvar_2 = dot (p_1, p_1);
    return tmpvar_2;
}

mat2 rotate(in highp float angle_3)
{
    angle_3 = (angle_3 * 0.01745556);
    float tmpvar_4;
    tmpvar_4 = sin(angle_3);
    float tmpvar_5;
    tmpvar_5 = cos(angle_3);
    mat2 tmpvar_6;
    tmpvar_6[uint(0)].x = tmpvar_5;
    tmpvar_6[uint(0)].y = -(tmpvar_4);
    tmpvar_6[1u].x = tmpvar_4;
    tmpvar_6[1u].y = tmpvar_5;
    return tmpvar_6;
}

float smin(in highp float a_7, in highp float b_8, in highp float k_9)
{
    float tmpvar_10;
    tmpvar_10 = max ((k_9 + -(abs((a_7 + -(b_8))))), 0.0);
    return (min (a_7, b_8) + -((((tmpvar_10 * tmpvar_10) * tmpvar_10) * (1.0/(((6.0 * k_9) * k_9))))));
}

float easeOutQuint(in highp float x_11)
{
    return (1.0 + -(exp2((5.0 * log2((1.0 + -(x_11)))))));
}

float get_cam_movement(in highp float time_12)
{
    float tmpvar_13;
    float tmpvar_14;
    tmpvar_14 = min (max (((sin(((time_12 * 0.03) + -1.2)) * 0.5) + 0.5), 0.0), 1.0);
    tmpvar_13 = (tmpvar_14 * (tmpvar_14 * (3.0 + -((2.0 * tmpvar_14)))));
    return tmpvar_13;
}

float ndot(in highp vec2 a_15, in highp vec2 b_16)
{
    return ((a_15.x * b_16.x) + -((a_15.y * b_16.y)));
}

float sdRhombus(in highp vec3 p_17, in highp float la_18, in highp float lb_19, in highp float h_20, in highp float ra_21)
{
    highp vec2 b_22;
    vec3 tmpvar_23;
    tmpvar_23 = abs(p_17);
    p_17 = tmpvar_23;
    vec2 tmpvar_24;
    tmpvar_24.x = la_18;
    tmpvar_24.y = lb_19;
    b_22 = tmpvar_24;
    float tmpvar_25;
    tmpvar_25 = ndot (tmpvar_24, (tmpvar_24 + -((2.0 * tmpvar_23.xz))));
    float tmpvar_26;
    tmpvar_26 = min (max ((tmpvar_25 * (1.0/(dot (b_22, b_22)))), -1.0), 1.0);
    vec2 tmpvar_27;
    tmpvar_27.x = (1.0 + -(tmpvar_26));
    tmpvar_27.y = (1.0 + tmpvar_26);
    vec2 tmpvar_28;
    tmpvar_28 = (p_17.xz + -(((0.5 * b_22) * tmpvar_27)));
    vec2 tmpvar_29;
    tmpvar_29.x = ((sqrt(abs(dot (tmpvar_28, tmpvar_28))) * sign((((p_17.x * b_22.y) + (p_17.z * b_22.x)) + -((b_22.x * b_22.y))))) + -(ra_21));
    tmpvar_29.y = (p_17.y + -(h_20));
    vec2 tmpvar_30;
    tmpvar_30 = max (tmpvar_29, 0.0);
    return (min (max (tmpvar_29.x, tmpvar_29.y), 0.0) + sqrt(abs(dot (tmpvar_30, tmpvar_30))));
}

float sdOctahedron(in highp vec3 p_31, in highp float s_32)
{
    vec3 tmpvar_33;
    tmpvar_33 = abs(p_31);
    p_31 = tmpvar_33;
    vec3 tmpvar_34;
    tmpvar_34 = ((3.0 * tmpvar_33) + -((((tmpvar_33.x + tmpvar_33.y) + tmpvar_33.z) + -(s_32))));
    vec3 tmpvar_35;
    tmpvar_35 = min (tmpvar_34, 0.0);
    vec3 tmpvar_36;
    tmpvar_36 = max ((((tmpvar_34 * 2.0) + -((tmpvar_35 * 3.0))) + ((tmpvar_35.x + tmpvar_35.y) + tmpvar_35.z)), 0.0);
    float tmpvar_37;
    vec3 tmpvar_38;
    tmpvar_38 = (tmpvar_33 + -(((s_32 * tmpvar_36) * (1.0/(((tmpvar_36.x + tmpvar_36.y) + tmpvar_36.z))))));
    tmpvar_37 = sqrt(abs(dot (tmpvar_38, tmpvar_38)));
    return tmpvar_37;
}
