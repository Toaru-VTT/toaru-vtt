package connect

import (
	"crypto/rand"
	"math/big"
	"strings"
)

// Subset of alphanum chosen for minimal chance of confusing letters in out-loud
// readouts, see https://stackoverflow.com/a/58098360
const charSet string = "cdefhjkmnprtvwxy2345689"
const charCount int64 = int64(len(charSet))

var normMappings map[rune]rune = map[rune]rune{
	'a': '4',
	'b': '6',
	'g': '9',
	'q': '9',
	'i': 'j',
	's': '5',
	'z': '2',
	'u': 'v',
}

// Generate a (cryptographically) random code of the given length
func Generate(length uint) string {
	chrs, nlen := big.NewInt(charCount), big.NewInt(int64(length))

	result := make([]byte, 0, length)
	limit := big.NewInt(0).Exp(chrs, nlen, nil)
	codeN, err := rand.Int(rand.Reader, limit)
	if err != nil {
		panic(err)
	}

	for i := uint(0); i < length; i++ {
		var next *big.Int
		codeN, next = codeN.DivMod(codeN, chrs, big.NewInt(0))
		result = append(result, charSet[next.Int64()])
	}

	return string(result)
}

// Normalize a code to be misread-resistant
func Normalize(code string) string {
	lowered := strings.ToLower(code)
	norm := make([]rune, 0, len(code))
	for _, char := range lowered {
		if normMappings[char] != 0 {
			norm = append(norm, normMappings[char])
		} else {
			norm = append(norm, char)
		}
	}
	return string(norm)
}

func GetCode(kv KeyVal, state *Canvas) string {
	code := Generate(6)
	for length := uint(7); kv.Get(code) != nil; length++ {
		code = Generate(length)
	}
	kv.Put(code, state)
	return code
}
