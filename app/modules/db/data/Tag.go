package data

type Tag struct {
	//唯一標識
	Id int64
	//父節點 根節點 pid == 0
	Pid int64

	//標籤名
	Name string

	//標籤下 檔案數量
	Docs int
}
