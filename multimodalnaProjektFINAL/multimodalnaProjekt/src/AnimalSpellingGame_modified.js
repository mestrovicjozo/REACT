import LanguageSelector from "./LanguageSelector";
import React, { useState, useEffect } from "react";
import ReactModal from "react-modal";
import animalsData from "./animals.json";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEraser, faChevronLeft, faChevronRight, faCircleQuestion, faGear } from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from 'react-confetti';

// Import sound effects
import correctSound from './sounds/correct.mp3.wav';
import celebrationSound from './sounds/celebration.mp3.wav';

const AnimalSpellingGame = () => {
  ReactModal.setAppElement("#root");

  // Create audio objects
  const correctAudio = new Audio(correctSound);
  const celebrationAudio = new Audio(celebrationSound);

  // Add error handling for audio
  useEffect(() => {
    correctAudio.load();
    celebrationAudio.load();
  }, []);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const toggleSettings = () => setIsSettingsOpen(!isSettingsOpen);

  const [level, setLevel] = useState("1");
  const [animalSequence, setAnimalSequence] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [currentAnimal, setCurrentAnimal] = useState(null);
  const [shuffledLetters, setShuffledLetters] = useState([]);
  const [boxes, setBoxes] = useState([]);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [isEraseMode, setIsEraseMode] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false); // novo

  const [unlockClicks, setUnlockClicks] = useState({
    topLeft: false,
    topRight: false,
    bottomLeft: false,
    bottomRight: false,
  });

  const isUnlocked = Object.values(unlockClicks).every(Boolean);

  const ghostLetterPool = "ABCČĆDDŽEFGHIJKLLJMNNJOPRSŠTUVZŽ";

  const [isCorrect, setIsCorrect] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showFinalConfetti, setShowFinalConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [animalFacts, setAnimalFacts] = useState("");
  const [factsLoading, setFactsLoading] = useState(false);

  const toggleEraseMode = () => {
    setIsEraseMode(true);
  };

  const handleBoxClick = (index) => {
    if (!isUnlocked) return;
    if (isCorrect) return; // Prevent any box clicks when word is correct

    if (isEraseMode) {
      if (boxes[index]) {
        const erasedLetter = boxes[index];
        const newBoxes = [...boxes];
        newBoxes[index] = null;
        setBoxes(newBoxes);
        setShuffledLetters([...shuffledLetters, erasedLetter]);
        setIsEraseMode(false);
      }
      return;
    }
    if (selectedLetter && !boxes[index]) {
      const newBoxes = [...boxes];
      newBoxes[index] = selectedLetter.letter;
      setBoxes(newBoxes);

      const newLetters = [...shuffledLetters];
      newLetters.splice(selectedLetter.index, 1);
      setShuffledLetters(newLetters);

      setSelectedLetter(null);
      
      // Check if the word is correct after placing a letter
      const isWordCorrect = newBoxes.join("") === (currentAnimal?.ime || "");
      setIsCorrect(isWordCorrect);
    }
  };

  const shuffleWord = (word) => {
    let shuffled;
    do {
      shuffled = word.split("").sort(() => Math.random() - 0.5);
    } while (shuffled.join("") === word);
    return shuffled;
  };

  const filterAnimalsByLevel = (all, lvl) => {
    return all.filter((a) => (lvl === "1" ? a.ime.length <= 5 : a.ime.length > 5));
  };

  const generateAnimalSequence = () => {
    const level1 = filterAnimalsByLevel(animalsData, "1").sort(() => 0.5 - Math.random());
    const level2 = filterAnimalsByLevel(animalsData, "2").sort(() => 0.5 - Math.random());
    const fullSequence = [...level1, ...level2];
    setAnimalSequence(fullSequence);
    setLevel("1");
    loadAnimal(fullSequence[0], "1");
  };

  const loadAnimal = (animal, level) => {
    let correctLetters = animal.ime.toUpperCase().split("");
    let allLetters = [...correctLetters];

    if (level === "2") {
      const ghostCount = Math.floor(correctLetters.length / 2);
      const availableGhosts = ghostLetterPool.split("").filter(
        (l) => !correctLetters.includes(l)
      );
      for (let i = 0; i < ghostCount; i++) {
        const randIndex = Math.floor(Math.random() * availableGhosts.length);
        allLetters.push(availableGhosts[randIndex]);
      }
    }

    const shuffled = shuffleWord(allLetters.join(""));
    setCurrentAnimal(animal);
    setBoxes(Array(animal.ime.length).fill(null));
    setShuffledLetters(shuffled);
    setSelectedLetter(null);
    setImageLoaded(false); // reset loading
    setIsCorrect(false); // Reset the correct state when loading new animal

    setUnlockClicks({
      topLeft: false,
      topRight: false,
      bottomLeft: false,
      bottomRight: false,
    });
  };

  const handleSelectLetter = (letter, index) => {
    if (!isUnlocked) return;
    setSelectedLetter({ letter, index });
  };

  const handleUndo = () => {
    if (!isUnlocked) return;
    if (currentIndex > 0) {
      const previousIndex = currentIndex - 1;
      const previousAnimal = animalSequence[previousIndex];
      const previousLevel = previousAnimal.ime.length <= 5 ? "1" : "2";
      setLevel(previousLevel);
      setCurrentIndex(previousIndex);
      loadAnimal(previousAnimal, previousLevel);
      setAnimalFacts(""); // Reset facts on undo
    }
  };

  const handleNext = () => {
    if (!isUnlocked) return;
    if (currentIndex < animalSequence.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextAnimal = animalSequence[nextIndex];
      const nextLevel = nextAnimal.ime.length <= 5 ? "1" : "2";
      setLevel(nextLevel);
      setCurrentIndex(nextIndex);
      loadAnimal(nextAnimal, nextLevel);
      setAnimalFacts(""); // Reset facts on next
    }
  };

  const handleHelp = () => {
    if (!isUnlocked) return;
    const correctLetters = currentAnimal.ime.split("");
    const firstEmpty = boxes.findIndex((b) => b === null);

    if (firstEmpty !== -1) {
      const neededLetter = correctLetters[firstEmpty];
      const indexInPool = shuffledLetters.findIndex((l) => l === neededLetter);
      if (indexInPool !== -1) {
        const newBoxes = [...boxes];
        newBoxes[firstEmpty] = neededLetter;
        setBoxes(newBoxes);
        const newLetters = [...shuffledLetters];
        newLetters.splice(indexInPool, 1);
        setShuffledLetters(newLetters);
      }
    }
  };

  const handleCornerClick = (corner) => {
    setUnlockClicks((prev) => ({ ...prev, [corner]: true }));
  };

  useEffect(() => {
    generateAnimalSequence();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Modify the useEffect for isCorrect
  useEffect(() => {
    if (isCorrect) {
      try {
        correctAudio.currentTime = 0;
        correctAudio.play().catch(error => {
          console.log('Audio play prevented - waiting for user interaction');
        });
        setShowConfetti(true);
        // Hide confetti after 3 seconds
        setTimeout(() => setShowConfetti(false), 3000);

        // Fetch animal facts from backend
        setFactsLoading(true);
        fetch("/api/animal-facts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ animalName: currentAnimal.ime })
        })
          .then(res => res.json())
          .then(data => {
            setAnimalFacts(data.facts);
            setFactsLoading(false);
          })
          .catch(() => {
            setAnimalFacts("Nije moguće dohvatiti činjenice o životinji.");
            setFactsLoading(false);
          });

        // If it's the last word, show the celebration
        if (currentIndex === animalSequence.length - 1) {
          setShowFinalConfetti(true);
          try {
            celebrationAudio.currentTime = 0;
            celebrationAudio.play().catch(error => {
              console.log('Audio play prevented - waiting for user interaction');
            });
          } catch (error) {
            console.log('Error with celebration audio:', error);
          }
          setTimeout(() => {
            setShowFinalConfetti(false);
            celebrationAudio.pause();
            celebrationAudio.currentTime = 0;
          }, 10000);
        }
      } catch (error) {
        console.log('Error with audio:', error);
      }
    } else {
      setAnimalFacts(""); // Reset facts when not correct
    }
  }, [isCorrect]);

  return (
    <div className="relative w-full h-full bg-gray-900 text-white">
      <div className="absolute top-4 right-4 z-50">
        <motion.button
          onClick={toggleSettings}
          className="text-neutral-900 text-7xl hover:scale-110 hover:rotate-12 transition-transform duration-200 bg-white rounded-full p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
          title="Postavke"
          whileHover={{ scale: 1.1, rotate: 12 }}
          whileTap={{ scale: 0.95 }}
        >
          <FontAwesomeIcon icon={faGear} size="1.5x" />
        </motion.button>
      </div>

      <div className={`flex flex-col items-center justify-center scale-[1.8] origin-center h-full transition-colors duration-500 ${isUnlocked ? 'bg-sky-50' : 'bg-black'}`}>
        {!currentAnimal ? (
          <p>Učitavanje...</p>
        ) : (
          <>
            <div className="relative w-64 h-64">
              {isUnlocked && (
                <motion.div 
                  className="absolute -left-16 top-1/2 transform -translate-y-1/2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.button
                    onClick={handleUndo}
                    className="bg-gradient-to-r from-teal-400 to-teal-600 text-white p-4 rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
                    whileHover={{ 
                      scale: 1.1,
                      boxShadow: "6px 6px 0px 0px rgba(0,0,0,1)"
                    }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <FontAwesomeIcon icon={faChevronLeft} size="2x" />
                  </motion.button>
                </motion.div>
              )}

              {isCorrect && (
                <motion.div 
                  className="absolute inset-x-0 -top-12 text-center"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-4xl font-bold text-green-600">
                    Bravo!
                  </p>
                </motion.div>
              )}

              <AnimatePresence mode="wait">
                <motion.img
                  key={currentAnimal.ime}
                  src={require(`./${currentAnimal.putanja}`)}
                  alt={currentAnimal.ime}
                  onLoad={() => setImageLoaded(true)}
                  className={`object-cover rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black w-full h-full
                    ${!isUnlocked ? "blur-[2px] opacity-60" : "filter-none opacity-100"}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>

              {!isUnlocked &&
                ["topLeft", "topRight", "bottomLeft", "bottomRight"].map((corner) => (
                  <motion.div
                    key={corner}
                    onClick={() => handleCornerClick(corner)}
                    className={`
                      absolute
                      ${corner === "topLeft" ? "top-0 left-0" : ""}
                      ${corner === "topRight" ? "top-0 right-0" : ""}
                      ${corner === "bottomLeft" ? "bottom-0 left-0" : ""}
                      ${corner === "bottomRight" ? "bottom-0 right-0" : ""}
                      w-32 h-32 cursor-pointer rounded-lg transition-all duration-500
                      ${
                        unlockClicks[corner]
                          ? "opacity-0 pointer-events-none bg-transparent"
                          : "bg-white bg-opacity-40 backdrop-blur-20 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
                      }
                    `}
                    title={`Klikni da otključaš kvadrant ${corner}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  />
                ))}
              {isUnlocked && (
                <motion.div 
                  className="absolute -right-16 top-1/2 transform -translate-y-1/2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.button
                    onClick={handleNext}
                    className="bg-gradient-to-r from-teal-400 to-teal-600 text-white p-4 rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
                    whileHover={{ 
                      scale: 1.1,
                      boxShadow: "6px 6px 0px 0px rgba(0,0,0,1)"
                    }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <FontAwesomeIcon icon={faChevronRight} size="2x" />
                  </motion.button>
                </motion.div>
              )}
              {isCorrect && (
                <div className="cartoon-facts absolute right-[-440px] top-1/2 -translate-y-1/2 z-40">
                  {factsLoading ? "Učitavam zanimljive činjenice..." :
                    animalFacts === "Nije moguće dohvatiti činjenice o životinji." ? (
                      <span style={{ color: '#e53e3e', fontWeight: 'bold' }}>Nažalost, ne mogu dohvatiti zanimljive činjenice o ovoj životinji. Pokušaj ponovno kasnije!</span>
                    ) : animalFacts}
                </div>
              )}
            </div>

            {isUnlocked && imageLoaded && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-wrap justify-center mb-6 gap-4 mt-6">
                  {shuffledLetters.map((letter, idx) => (
                    <motion.div
                      key={idx}
                      onClick={() => handleSelectLetter(letter, idx)}
                      className={
                        "w-14 h-14 flex items-center justify-center text-xl font-bold rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] cursor-pointer transition border-2 border-black " +
                        (selectedLetter?.index === idx
                          ? "bg-yellow-400 text-black"
                          : "bg-blue-400 hover:bg-blue-500")
                      }
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {letter}
                    </motion.div>
                  ))}
                </div>

                <div className="flex justify-center gap-4 mb-4">
                  {boxes.map((letter, idx) => {
                    const correctLetter = currentAnimal.ime[idx];
                    let color = "bg-gray-800";
                    if (letter) {
                      color = letter === correctLetter ? "bg-green-600" : "bg-red-600";
                    }
                    return (
                      <motion.div
                        key={idx}
                        onClick={() => handleBoxClick(idx)}
                        className={`w-14 h-14 border-2 border-black ${color} flex items-center justify-center text-xl font-bold rounded-lg cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {letter}
                      </motion.div>
                    );
                  })}
                </div>

                <div className="flex justify-center gap-4 mt-2">
                  <motion.button
                    onClick={toggleEraseMode}
                    disabled={isCorrect}
                    className={`px-4 py-2 ${
                      isEraseMode ? "bg-pink-600" : "bg-pink-400 hover:bg-pink-500"
                    } text-black font-semibold rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-2 border-black ${
                      isCorrect ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    title={isCorrect ? "Ne možeš brisati kada je riječ točna" : "Uključi način brisanja"}
                    whileHover={!isCorrect ? { 
                      scale: 1.1,
                      boxShadow: "6px 6px 0px 0px rgba(0,0,0,1)"
                    } : {}}
                    whileTap={!isCorrect ? { scale: 0.95 } : {}}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <FontAwesomeIcon icon={faEraser} size="2x" />
                  </motion.button>

                  <motion.button
                    onClick={handleHelp}
                    disabled={isCorrect}
                    className={`px-4 py-2 bg-[#f1f505]/70 hover:bg-yellow-200 text-black font-extrabold rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-2 border-black ${
                      isCorrect ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    whileHover={!isCorrect ? { 
                      scale: 1.1,
                      boxShadow: "6px 6px 0px 0px rgba(0,0,0,1)"
                    } : {}}
                    whileTap={!isCorrect ? { scale: 0.95 } : {}}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <FontAwesomeIcon icon={faCircleQuestion} size="2x" />
                  </motion.button>
                </div>

                {showConfetti && (
                  <Confetti
                    width={windowSize.width}
                    height={windowSize.height}
                    recycle={false}
                    numberOfPieces={400}
                    gravity={0.2}
                  />
                )}
                {showFinalConfetti && (
                  <Confetti
                    width={windowSize.width}
                    height={windowSize.height}
                    recycle={true}
                    numberOfPieces={3000}
                    gravity={0.1}
                    colors={['#FFD700', '#FF69B4', '#00CED1', '#FF4500', '#7B68EE', '#32CD32']}
                  />
                )}
              </motion.div>
            )}

            <ReactModal
              isOpen={isSettingsOpen}
              onRequestClose={toggleSettings}
              className="bg-white text-black p-6 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black w-80 max-h-[90vh] overflow-auto mx-auto mt-20"
              overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50"
            >
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-lg font-bold mb-4">Postavke</h2>
                <div className="mb-4">
                  <label htmlFor="level" className="block mb-1 font-semibold">
                    Razina:
                  </label>
                  <select
                    id="level"
                    value={level}
                    onChange={(e) => {
                      const newLevel = e.target.value;
                      setLevel(newLevel);
                      const levelAnimals = filterAnimalsByLevel(animalsData, newLevel);
                      if (levelAnimals.length > 0) {
                        const randomAnimal = levelAnimals[Math.floor(Math.random() * levelAnimals.length)];
                        const newIndex = animalSequence.findIndex(a => a.ime === randomAnimal.ime);
                        if (newIndex !== -1) {
                          setCurrentIndex(newIndex);
                          loadAnimal(randomAnimal, newLevel);
                        }
                      }
                    }}
                    className="w-full px-2 py-1 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <option value="1">Razina 1 (≤ 5 slova)</option>
                    <option value="2">Razina 2 (&gt; 5 slova)</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block mb-1 font-semibold">Jezik:</label>
                  <div className="flex flex-col gap-2">
                    <LanguageSelector />
                  </div>
                </div>

                <motion.button
                  onClick={toggleSettings}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
                  whileHover={{ 
                    scale: 1.1,
                    boxShadow: "6px 6px 0px 0px rgba(0,0,0,1)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  Zatvori
                </motion.button>
              </motion.div>
            </ReactModal>
          </>
        )}
      </div>
    </div>
  );
};

export default AnimalSpellingGame;
