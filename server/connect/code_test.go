package connect

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGenerateLengthMatchesGivenLength(t *testing.T) {
	for i := 4; i <= 20; i++ {
		assert.Equal(t, len(Generate(uint(i))), i)
	}
}

func TestNormalize(t *testing.T) {
	assert.Equal(t, Normalize("VN2EYH"), "vn2eyh")
	assert.Equal(t, Normalize("bxwsaf"), "6xw54f")
}
