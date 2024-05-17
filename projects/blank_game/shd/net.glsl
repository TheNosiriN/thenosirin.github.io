precision mediump float;

varying vec2 vTextureCoord;//The coordinates of the current pixel
uniform sampler2D uSampler;//The image data

#define PI 3.142

float grid(vec2 fragCoord, float space, float gridWidth)
{
	vec2 p  = fragCoord - vec2(.5);
	vec2 size = vec2(gridWidth - .5);

	vec2 a1 = mod(p - size, space);
	vec2 a2 = mod(p + size, space);
	vec2 a = a2 - a1;

	float g = min(a.x, a.y);
	return clamp(g, 0.0, 1.0);
}

mat2 rotationMatrix(float angle)
{
	angle *= PI / 180.0;
	float s = sin(angle), c = cos(angle);
	return mat2( c, -s, s, c );
}

void main(void)
{
	float grd = clamp(grid(gl_FragCoord.xy, 20.0, 2.0), 0.0, 1.0);

	// Output to screen
	if (grd == 1.0){ discard; }
	gl_FragColor = vec4(vec3(grd),1.0);
}
