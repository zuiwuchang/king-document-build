package data

//文檔節點
type Node struct {
	//節點
	Id int64

	//父節點
	Pid int64

	//文檔名
	Name string

	//文檔 簡短描述
	Text string
}
