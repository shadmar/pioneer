// Copyright © 2008-2012 Pioneer Developers. See AUTHORS.txt for details
// Licensed under the terms of the GPL v3. See licenses/GPL-3.txt

#ifndef _STATICMESH_H
#define _STATICMESH_H

#include "Renderer.h"
#include "VertexArray.h"
#include <vector>

namespace Graphics {

class Surface;

/*
 * StaticMesh can hold multiple surfaces and is intended for complex,
 * unchanging geometry. Renderers can buffer the contents into VBOs or
 * whatever they prefer. The original vertex data is kept for reloading
 * on context switch.
 *
 * XXX 29-09-2012 It is technically possible the model loader uses
 * one surface in multiple SMs. They should be converted to RefCountedPtr here.
 */
class StaticMesh : public Renderable {
public:
	StaticMesh(PrimitiveType t);
	~StaticMesh();

	PrimitiveType GetPrimtiveType() const { return m_primitiveType; }

	void AddSurface(Surface *s);
	Surface *GetSurface(int idx) const { return m_surfaces.at(idx); }

	//useful to know for buffers
	int GetNumVerts() const;
	int GetNumIndices() const;
	int GetAvailableVertexSpace() const;

	AttributeSet GetAttributeSet() const;

	typedef std::vector<Surface*>::const_iterator SurfaceIterator;
	const SurfaceIterator SurfacesBegin() const { return m_surfaces.begin(); }
	const SurfaceIterator SurfacesEnd() const { return m_surfaces.end(); }

	bool cached;

	static const int MAX_VERTICES = 65536;

private:
	PrimitiveType m_primitiveType;
	std::vector<Surface*> m_surfaces;
};

}

#endif
