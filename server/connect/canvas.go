package connect

type Canvas struct {
	Count int `msgpack:"count" json:"count"`
}

func (c *Canvas) Merge(other *Canvas) Canvas {
	// TODO actual merge impl, see e.g. CRDT tree-based indexing
	// https://madebyevan.com/algos/crdt-tree-based-indexing/
	return Canvas{
		Count: max(c.Count, other.Count),
	}
}
