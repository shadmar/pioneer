varying vec3 varyingEyepos;
varying vec3 varyingNormal;
varying vec4 vertexColor;
varying vec4 varyingemission;

void main(void)
{
	gl_Position = logarithmicTransform();
	vertexColor = gl_Color;
	varyingEyepos = vec3(gl_ModelViewMatrix * gl_Vertex);
	varyingNormal = gl_NormalMatrix * gl_Normal;

#ifdef TERRAIN_WITH_LAVA
	varyingemission=gl_FrontMaterial.emission;
	//Glow lava terrains
	if ( vertexColor.g < 0.01 && vertexColor.b < 0.0075 && vertexColor.r < 0.25 ) {
		varyingemission=8.0*vertexColor;
	}
#endif

}
