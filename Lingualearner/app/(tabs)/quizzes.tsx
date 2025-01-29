import React, { useState, useEffect } from "react";
import { Animated, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

const quizzes = [
  {
    question: "What is the capital of France?",
    correctAnswer: "Paris",
    options: ["Paris", "London", "Berlin", "Madrid"],
  },
  {
    question: "Translate 'Hello' to Spanish.",
    correctAnswer: "Hola",
    options: ["Hola", "Bonjour", "Ciao", "Hallo"],
  },
  {
    question: "What is the past tense of 'go'?",
    correctAnswer: "went",
    options: ["goed", "went", "gone", "going"],
  },
  {
    question: "What is the largest planet in our Solar System?",
    correctAnswer: "Jupiter",
    options: ["Mars", "Venus", "Jupiter", "Saturn"],
  },
  {
    question: "What is 2 + 2?",
    correctAnswer: "4",
    options: ["3", "4", "5", "6"],
  },
  {
    question: "Who wrote 'Romeo and Juliet'?",
    correctAnswer: "William Shakespeare",
    options: [
      "Charles Dickens",
      "William Shakespeare",
      "Jane Austen",
      "Mark Twain",
    ],
  },
  {
    question: "Translate 'Serendipity' to French.",
    correctAnswer: "Sérendipité",
    options: ["Sérendipité", "Bonheur", "Chance", "Destin"],
  },
  
];

const Quizzes = () => {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const router = useRouter();

  useEffect(() => {
    Animated.spring(fadeAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  }, [current, fadeAnim]);

  const handleSelect = (option: string) => {
    const correct = option === quizzes[current].correctAnswer;
    setIsCorrect(correct);
    setSelected(option);
    if (correct) {
      setScore((prev) => prev + 1);
    }
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        setIsCorrect(null);
        setSelected(null);
        setCurrent((prev) => {
          if (prev + 1 < quizzes.length) {
            return prev + 1;
          } else {
            return prev;
            router.push("./homeScreen");
            
          }
        });
      }, 1000);
    });
  };

  if (current >= quizzes.length) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.score}>
          Your Score: {score} / {quizzes.length}
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <ThemedText style={styles.question}>
          {quizzes[current].question}
        </ThemedText>
      </Animated.View>
      {quizzes[current].options.map((option) => (
        <TouchableOpacity
          key={option}
          style={[
            styles.optionButton,
            selected === option && styles.selectedOption,
          ]}
          onPress={() => handleSelect(option)}
          disabled={selected !== null}
        >
          <ThemedText style={styles.optionText}>{option}</ThemedText>
        </TouchableOpacity>
      ))}
      {isCorrect !== null && (
        <ThemedText style={isCorrect ? styles.correct : styles.incorrect}>
          {isCorrect ? "Correct!" : "Incorrect. Moving on..."}
        </ThemedText>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  question: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  optionButton: {
    backgroundColor: "#e0e0e0",
    padding: 15,
    borderRadius: 8,
    marginVertical: 5,
  },
  selectedOption: {
    backgroundColor: "#a0a0a0",
  },
  optionText: {
    fontSize: 16,
    textAlign: "center",
  },
  correct: {
    color: "green",
    marginTop: 20,
    textAlign: "center",
  },
  incorrect: {
    color: "red",
    marginTop: 20,
    textAlign: "center",
  },
  score: {
    fontSize: 20,
    textAlign: "center",
    marginTop: 50,
  },
});

export default Quizzes;
