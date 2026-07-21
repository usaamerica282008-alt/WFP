const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
// Koodii kana dabili (faayiloota html akka gadi dhiisuuf)
app.use(express.static(__dirname));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 1. Database Connect (MongoDB)
mongoose.connect('mongodb://127.0.0.1:27017/wfp_db')
  .then(() => console.log('MongoDB waliin wal qunnamteera.'))
  .catch(err => console.error('Database wal qunnamuun hin danda\'amne:', err));

// 2. Database Schema
const DepositSchema = new mongoose.Schema({
    username: String,
    amount: Number,
    transactionId: String,
    receiptPath: String,
    status: { type: String, default: 'Pending' }
});
const Deposit = mongoose.model('Deposit', DepositSchema);

// 3. Fakkii Simachuuf (Multer Setup)
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });

// 4. API USER: Kaffaltii kuusuu
app.post('/api/user/deposit', upload.single('receipt'), async (req, res) => {
    try {
        const { username, amount, transactionId } = req.body;
        const receiptPath = req.file ? req.file.path : '';

        const newDeposit = new Deposit({ username, amount, transactionId, receiptPath });
        await newDeposit.save();

        res.json({ success: true, message: "Kaffalteen keessan ergameera! Hanga admin mirkaneessutti eegaa." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Koodii back-end irratti dogoggoratu uumame." });
    }
});

// 5. API ADMIN: Gaaffiiwwan fiduu
app.get('/api/admin/deposits', async (req, res) => {
    try {
        const requests = await Deposit.find();
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: "Deetaa fiduun hin danda'amne." });
    }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server kun port ${PORT} irratti ka'eera.`));

