package manipulator

import (
	"archive/tar"
	"github.com/go-xorm/xorm"
	"os"
)

type Offline struct {
}

func (o *Offline) Create(str string) error {
	session := NewSession()
	defer session.Close()
	err := session.Begin()
	if err != nil {
		return err
	}
	defer session.Commit()

	//創建 tar 檔案 io.Writer
	var file *os.File
	file, err = os.Create(str)
	if err != nil {
		return nil
	}
	defer file.Close()

	//創建 tar writer
	tw := tar.NewWriter(file)
	defer tw.Close()

	if err = o.createTags(session, tw); err != nil {
		return err
	}
	return nil
}
func (o *Offline) createTags(session *xorm.Session, tw *tar.Writer) error {

	return nil
}
