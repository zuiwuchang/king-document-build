package crypto

import (
	"crypto/md5"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"io"
	"time"
)

func GetHash(str string) string {
	hash := md5.New()
	hash.Write([]byte(str))
	return hex.EncodeToString(hash.Sum(nil))
}
func GetUuid(str string) string {
	b := make([]byte, 128)
	io.ReadFull(rand.Reader, b)
	str = fmt.Sprintf("%v%v%x", str, time.Now(), b)
	return GetHash(str)
}
