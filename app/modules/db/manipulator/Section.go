package manipulator

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/go-xorm/xorm"
	"io/ioutil"
	"king-document-build/app/modules/db/data"
	"os"
)

type Section struct {
}

func (s *Section) New(bean *data.Section) error {
	session := NewSession()
	defer session.Close()

	var err error
	if err = session.Begin(); err != nil {
		return err
	}
	defer func() {
		if err == nil {
			session.Commit()
		} else {
			session.Rollback()
		}
	}()

	var has bool
	if has, err = session.Id(bean.Panel).Get(&data.Panel{}); err != nil {
		return err
	} else if !has {
		err = fmt.Errorf("chapter id not found (%v)", bean.Panel)
		return err
	}

	if _, err = session.InsertOne(bean); err != nil {
		return err
	}
	dir := GetRootPath() + "/sections/" + fmt.Sprint(bean.Id)
	if err = os.MkdirAll(dir, 0774); err != nil {
		return nil
	}
	return nil
}

func (s *Section) Find(panel int64, beans *[]data.Section) error {
	return GetEngine().Where("panel = ?", panel).Desc("Sort").Find(beans)
}
func (s *Section) Read(bean *data.Section) {
	path := GetRootPath() + "/sections/" + fmt.Sprint(bean.Id) + ".txt"
	s.readFile(path, &bean.Str)
}
func (s *Section) Save(id int64, val string) error {
	session := NewSession()
	defer session.Close()
	err := session.Begin()
	if err != nil {
		return err
	}
	defer func() {
		if err == nil {
			session.Commit()
		} else {
			session.Rollback()
		}
	}()
	var has bool
	if has, err = session.ID(id).Cols("id").Get(&data.Section{}); err != nil {
		return err
	} else if !has {
		return fmt.Errorf("section id not found (%v)", id)
	}

	path := GetRootPath() + "/sections/" + fmt.Sprint(id) + ".txt"

	err = s.writeFile(path, val)
	return err
}
func (s *Section) readFile(path string, out *string) error {
	b, e := ioutil.ReadFile(path)
	if e != nil {
		return e
	}
	start := len("var __v=")
	if len(b) < start+2 {
		return errors.New("data format error")
	}
	b = b[start:]
	e = json.Unmarshal(b, out)
	return e
}
func (s *Section) writeFile(path, val string) error {
	f, err := os.Create(path)
	if err != nil {
		return err
	}
	defer f.Close()
	_, err = f.WriteString("var __v=")
	if err != nil {
		return err
	}

	b, err := json.Marshal(val)
	if err != nil {
		return err
	}
	_, err = f.Write(b)
	return err
}
func (s *Section) Rename(bean *data.Section) error {
	if n, err := GetEngine().Id(bean.Id).MustCols("name").Update(bean); err != nil {
		return err
	} else if n == 0 {
		return fmt.Errorf("section id not found (%v)", n)
	}
	return nil
}

func (s *Section) Sort(ids []int64) error {
	session := NewSession()
	defer session.Close()
	err := session.Begin()
	if err != nil {
		return err
	}
	defer func() {
		if err == nil {
			session.Commit()
		} else {
			session.Rollback()
		}
	}()

	n := int64(len(ids))
	var has bool
	for _, id := range ids {
		if has, err = session.Id(id).Cols("id").Get(&data.Section{}); err != nil {
			return err
		} else if !has {
			return fmt.Errorf("section id not found (%v)", id)
		}
		if _, err = session.Id(id).Update(data.Section{Sort: n}); err != nil {
			return err
		}
		n--
	}

	return nil
}
func (s *Section) Remove3(session *xorm.Session, id int64, strs *[]string) error {
	_, err := session.Id(id).Delete(data.Section{})
	if err != nil {
		return err
	}
	if strs != nil {
		*strs = append(*strs, GetRootPath()+"/sections/"+fmt.Sprint(id))
	}
	return nil
}
func (s *Section) Remove(id int64) error {
	session := NewSession()
	defer session.Close()
	err := session.Begin()
	if err != nil {
		return err
	}
	strs := make([]string, 0, 100)
	defer func() {
		if err == nil {
			for _, str := range strs {
				os.Remove(str + ".txt")
				os.RemoveAll(str)
			}
			session.Commit()
		} else {
			session.Rollback()
		}
	}()
	err = s.Remove3(session, id, &strs)
	return err
}
