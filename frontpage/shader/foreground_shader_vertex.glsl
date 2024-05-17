uniform float iTime;
uniform vec3 iResolution;
uniform float devicePixelRatio;

out vec2 Coord;
out vec2 Size;
flat out float Time;
flat out float GridMult;
flat out int Type;

const vec2 uvs[6] = vec2[6](
    vec2(-1.0, -1.0),
    vec2( 1.0, -1.0),
    vec2(-1.0, 1.0),
    vec2( 1.0, 1.0),
    vec2(-1.0, 1.0),
    vec2( 1.0, -1.0)
);

void main() {
    Size = vertexInPosition1.xy;
    Coord = uvs[gl_VertexID % 6] * Size;

    vec2 pos = (vertexInPosition.xy*devicePixelRatio*2.)/iResolution.xy * vec2(1,-1) + vec2(-1,1);
    gl_Position = vec4(pos, 0.0, 1.0);

    float start_time = vertexInPosition2.x;
    float stop_time = vertexInPosition2.y;
    float speed = vertexInPosition2.z;
    Time = max(0., min(
        smoothstep(start_time, start_time+(1.0/speed), iTime-1.0),
        (stop_time <= start_time) ? 1.0 : smoothstep(stop_time+(1.0/speed), stop_time, iTime)
    ));

    Type = int(vertexInPosition3.x);
    GridMult = vertexInPosition3.y;
}
