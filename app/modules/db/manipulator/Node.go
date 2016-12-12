package manipulator

import (
	"encoding/json"
	"github.com/revel/revel"
	"io/ioutil"
	"king-document-build/app/modules/db/data"
	"os"
	"sync"
)

const (
	DATA_NODE_PATH = "/public/data/nodes.json"
)

var g_Mutex sync.Mutex
var g_Nodes map[int64]data.Node
var g_Id int64

func initNode() {
	g_Nodes = make(map[int64]data.Node)

	path := revel.BasePath + DATA_NODE_PATH
	f, err := os.Open(path)
	if err != nil {
		panic(err)
	}
	defer f.Close()
	b, err := ioutil.ReadAll(f)
	if err != nil {
		panic(err)
	}
	nodes := make([]data.Node, 0, 512)
	err = json.Unmarshal(b, &nodes)
	if err != nil {
		panic(err)
	}
	for _, node := range nodes {
		g_Nodes[node.Id] = node
		if g_Id < node.Id {
			g_Id = node.Id
		}
	}
}

type Node struct {
}
