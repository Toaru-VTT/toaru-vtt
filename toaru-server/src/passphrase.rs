use std::sync::OnceLock;

use rand::seq::IndexedRandom;

const WORDLIST: &str = include_str!("../wordlist/wordlist.txt");
static WORDS: OnceLock<Vec<&str>> = OnceLock::new();

pub fn get_passphrase() -> String {
    let words = WORDS.get_or_init(|| {
        WORDLIST
            .lines()
            .map(|l| l.trim())
            .filter(|l| !l.is_empty() && !l.starts_with('#'))
            .collect()
    });
    let mut rng = rand::rng();

    let words: Vec<String> = words
        .choose_multiple(&mut rng, 4)
        .map(|s| s.to_string())
        .collect();
    words.join("-")
}

#[cfg(test)]
mod test {
    use super::get_passphrase;

    #[test]
    fn test_get_passphrase() {
        let phrase1 = get_passphrase();
        let phrase2 = get_passphrase();
        assert_ne!(phrase1, phrase2)
    }
}
