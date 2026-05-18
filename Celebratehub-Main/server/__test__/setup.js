const mongoose = require("mongoose");

jest.setTimeout(60000);

// Mock natural to avoid ESM issues in tests
jest.mock("natural", () => ({
  LogisticRegressionClassifier: jest.fn().mockImplementation(() => ({
    addDocument: jest.fn(),
    train: jest.fn(),
    getClassifications: jest.fn().mockReturnValue([{ label: "default", value: 1 }])
  })),
  SentimentAnalyzer: jest.fn(),
  PorterStemmer: {},
  WordTokenizer: jest.fn().mockImplementation(() => ({
    tokenize: jest.fn().mockReturnValue([])
  }))
}));

// Mock transformers to avoid ESM issues
jest.mock("@xenova/transformers", () => ({
  pipeline: jest.fn()
}));

// Mock tensorflow node
jest.mock("@tensorflow/tfjs-node", () => ({}));

// Mock mongoose connect
mongoose.connect = jest.fn().mockResolvedValue(mongoose);
mongoose.disconnect = jest.fn().mockResolvedValue();

beforeAll(async () => {
  // Any global setup
});

afterAll(async () => {
  // Any global teardown
});
