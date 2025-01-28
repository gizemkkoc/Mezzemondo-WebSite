const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();


app.use(cors());
app.use(bodyParser.json());


const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'TurkishAppetizers',
    password: '179595',
    port: 5432,
});

// Yorum ekleme endpoint'i
app.post('/api/comments', async (req, res) => {
    console.log('Gelen istek:', req.body);

    try {
        const { name, email, comment } = req.body;
        
        if (!name || !email || !comment) {
            console.log('Eksik veri');
            return res.status(400).json({ error: 'Tüm alanlar gerekli' });
        }

        const currentDate = new Date().toISOString(); 

        const query = `
            INSERT INTO comments (name, email, comment, date)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const values = [name, email, comment, currentDate];
        
        console.log('Sorgu:', query);
        console.log('Değerler:', values);

        const result = await pool.query(query, values);
        console.log('DB Sonuç:', result.rows[0]);

        res.status(201).json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Veritabanı hatası:', error);
        res.status(500).json({ error: error.message });
    }
});

// Yorumları getirme endpoint'i
app.get('/api/comments', async (req, res) => {
    console.log('GET isteği alındı');
    
    try {
        const result = await pool.query('SELECT * FROM comments ORDER BY date DESC');
        console.log('Getirilen yorum sayısı:', result.rows.length);
        
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Yorumları getirme hatası:', error);
        res.status(500).json({
            success: false,
            error: 'Yorumlar getirilirken bir hata oluştu'
        });
    }
});

// Geri bildirim ekleme endpoint'i
app.post('/api/feedback', async (req, res) => {
    console.log('Gelen geri bildirim:', req.body);

    try {
        const { name, email, feedbackType, subject, message } = req.body;
        
        if (!name || !email || !feedbackType || !subject || !message) {
            return res.status(400).json({ error: 'Tüm alanlar gerekli' });
        }

        const query = `
            INSERT INTO feedback (name, email, feedback_type, subject, message)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const values = [name, email, feedbackType, subject, message];
        
        const result = await pool.query(query, values);
        console.log('DB Sonuç:', result.rows[0]);

        res.status(201).json({
            success: true,
            data: result.rows[0],
            message: 'Geri bildiriminiz için teşekkürler. En kısa sürede değerlendireceğiz.'
        });
    } catch (error) {
        console.error('Veritabanı hatası:', error);
        res.status(500).json({ error: error.message });
    }
});

// Geri bildirimleri listeleme endpoint'i (opsiyonel - admin panel için)
app.get('/api/feedback', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM feedback ORDER BY date DESC');
        
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Geri bildirimleri getirme hatası:', error);
        res.status(500).json({
            success: false,
            error: 'Geri bildirimler getirilirken bir hata oluştu'
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda çalışıyor`);
});