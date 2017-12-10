package manipulator

import (
	"fmt"
	"github.com/zuiwuchang/king-go/os/fileperm"
	"io"
	"king-document-build/app/modules/db/data"
	"os"
	"path"
	"sort"
)

const (
	FILES_ORDER_NAME = "NAME"
	FILES_ORDER_TYPE = "TYPE"
	FILES_ORDER_SIZE = "SIZE"
)

type Files struct {
}

func (f *Files) Find(files *data.Files, id int64, order, dir string) error {
	strPath := fmt.Sprintf("%s/sections/%v/%s", GetRootPath(), id, dir)
	files.Url = fmt.Sprintf("sections/%v/%s/", id, dir)

	file, err := os.Open(strPath)
	if err != nil {
		return err
	}
	defer file.Close()

	info, err := file.Stat()
	if err != nil {
		return err
	}
	if !info.IsDir() {
		return fmt.Errorf("%v is not a dir", dir)
	}

	infos, err := file.Readdir(0)
	if err != nil {
		return err
	}

	files.Count = len(infos)

	list := make([]data.File, 0, len(infos))
	for _, info := range infos {
		if info.IsDir() {
			continue
		}
		node := data.File{FileSize: info.Size(), FileName: info.Name(), DateTime: info.ModTime()}
		if dir == "image" {
			node.IsPhoto = true
			node.FileType = path.Ext(info.Name())
		}

		list = append(list, node)
	}
	files.FileList = list

	if FILES_ORDER_TYPE == order {
		f.sortType(files.FileList)
	} else if FILES_ORDER_SIZE == order {
		f.sortSize(files.FileList)
	} else {
		//f.sortName(files.FileList)
	}
	return nil
}

type fileType []data.File

func (f fileType) Len() int {
	return len(f)
}
func (f fileType) Less(i, j int) bool {
	return f[i].FileType < f[j].FileType
}
func (f fileType) Swap(i, j int) {
	f[i], f[j] = f[j], f[i]
}
func (f *Files) sortType(slice []data.File) {
	a := fileType(slice)
	if !sort.IsSorted(a) {
		sort.Sort(a)
	}
}

type fileSize []data.File

func (f fileSize) Len() int {
	return len(f)
}
func (f fileSize) Less(i, j int) bool {
	return f[i].FileSize < f[j].FileSize
}
func (f fileSize) Swap(i, j int) {
	f[i], f[j] = f[j], f[i]
}
func (f *Files) sortSize(slice []data.File) {
	a := fileSize(slice)
	if !sort.IsSorted(a) {
		sort.Sort(a)
	}
}

type fileName []data.File

func (f fileName) Len() int {
	return len(f)
}
func (f fileName) Less(i, j int) bool {
	return f[i].FileName < f[j].FileName
}
func (f fileName) Swap(i, j int) {
	f[i], f[j] = f[j], f[i]
}
func (f *Files) sortName(slice []data.File) {
	a := fileName(slice)
	if !sort.IsSorted(a) {
		sort.Sort(a)
	}
}
func (f *Files) Upload(id int64, dir, name string, r io.Reader) error {
	if has, err := GetEngine().Id(id).Cols("id").Get(&data.Section{}); err != nil {
		return err
	} else if !has {
		return fmt.Errorf("section id not found (%v)", id)
	}

	strPath := fmt.Sprintf("%s/sections/%v/%s/%s", GetRootPath(), id, dir, name)
	strDir := fmt.Sprintf("%s/sections/%v/%s", GetRootPath(), id, dir)
	os.MkdirAll(strDir, fileperm.Directory)
	file, err := os.Create(strPath)
	if err != nil {
		return err
	}
	defer file.Close()
	buf := make([]byte, 1024)
	var n int
	for {
		n, err = r.Read(buf)
		if err != nil {
			err = nil
			break
		}
		_, err = file.Write(buf[0:n])
		if err != nil {
			return err
		}
	}

	return nil
}
