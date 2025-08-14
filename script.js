class ReplicateAPITester {
    constructor() {
        this.apiKey = '';
        this.currentImage = null;
        this.segmentationResult = null;
        this.paintingResult = null;
        
        // Mallin versiot
        this.SAM2_MODEL = 'meta/sam-2:2c7b381af7ba6b0f71744066c4aba9c6f3b95f02d7bb110d7a0f0b1aaec12329';
        this.MODELS = {
            sdxl: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
            controlnet: 'jagilley/controlnet-sdxl:...',
            realistic: 'stability-ai/realistic-vision:...',
            sd15: 'stability-ai/stable-diffusion-2-inpainting:...',
            dreamshaper: 'cjwbw/dreamshaper:...'
        };
        
        this.initializeEventListeners();
        this.loadAPIKey();
    }

    initializeEventListeners() {
        // Kuva upload
        const imageInput = document.getElementById('imageInput');
        const uploadSection = document.getElementById('uploadSection');
        
        imageInput.addEventListener('change', (e) => this.handleImageUpload(e));
        
        // Drag & drop
        uploadSection.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadSection.classList.add('dragover');
        });
        
        uploadSection.addEventListener('dragleave', () => {
            uploadSection.classList.remove('dragover');
        });
        
        uploadSection.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadSection.classList.remove('dragover');
            this.handleFileDrop(e);
        });

        // Strength slider
        const strengthSlider = document.getElementById('strength');
        const strengthValue = document.getElementById('strengthValue');
        
        strengthSlider.addEventListener('input', (e) => {
            strengthValue.textContent = e.target.value;
        });

        // Guidance scale slider
        const guidanceSlider = document.getElementById('guidanceScale');
        const guidanceValue = document.getElementById('guidanceScaleValue');
        
        guidanceSlider.addEventListener('input', (e) => {
            guidanceValue.textContent = e.target.value;
        });

        // Points per side slider
        const pointsSlider = document.getElementById('pointsPerSide');
        const pointsValue = document.getElementById('pointsPerSideValue');
        
        pointsSlider.addEventListener('input', (e) => {
            pointsValue.textContent = e.target.value;
        });

        // IoU threshold slider
        const iouSlider = document.getElementById('predIouThresh');
        const iouValue = document.getElementById('predIouThreshValue');
        
        iouSlider.addEventListener('input', (e) => {
            iouValue.textContent = parseFloat(e.target.value).toFixed(2);
        });

        // Stability score threshold slider
        const stabilitySlider = document.getElementById('stabilityScoreThresh');
        const stabilityValue = document.getElementById('stabilityScoreThreshValue');
        
        stabilitySlider.addEventListener('input', (e) => {
            stabilityValue.textContent = parseFloat(e.target.value).toFixed(2);
        });

        // ControlNet strength slider
        const controlnetStrengthSlider = document.getElementById('controlnetStrength');
        const controlnetStrengthValue = document.getElementById('controlnetStrengthValue');
        
        if (controlnetStrengthSlider) {
            controlnetStrengthSlider.addEventListener('input', (e) => {
                controlnetStrengthValue.textContent = parseFloat(e.target.value).toFixed(1);
            });
        }

        // Realistic strength slider
        const realisticStrengthSlider = document.getElementById('realisticStrength');
        const realisticStrengthValue = document.getElementById('realisticStrengthValue');
        
        if (realisticStrengthSlider) {
            realisticStrengthSlider.addEventListener('input', (e) => {
                realisticStrengthValue.textContent = parseFloat(e.target.value).toFixed(1);
            });
        }

        // Generoi-nappi
        const generateBtn = document.getElementById('generateBtn');
        generateBtn.addEventListener('click', () => this.generateImage());

        // Mallin valinta
        const paintingModel = document.getElementById('paintingModel');
        paintingModel.addEventListener('change', () => this.showModelParams());
        
        // Prosessin tyyppi
        const processType = document.getElementById('processType');
        processType.addEventListener('change', () => this.updateProcessType());
        
        // Näytä oletusmallin parametrit
        this.showModelParams();
        this.updateProcessType();
    }

    updateProcessType() {
        const processType = document.getElementById('processType').value;
        const generateBtn = document.getElementById('generateBtn');
        
        if (processType === 'segmentation_only') {
            generateBtn.textContent = '🚀 Generoi segmentointi ($0.025)';
            generateBtn.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
        } else {
            generateBtn.textContent = '🚀 Generoi muokattu kuva';
            generateBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        }
    }

    async loadAPIKey() {
        // Yritetään ensin hakea API key Vercel environment variableista
        try {
            const response = await fetch('/api/get-api-key');
            if (response.ok) {
                const data = await response.json();
                if (data.apiKey) {
                    this.apiKey = data.apiKey;
                    console.log('API key haettu Vercel endpointista');
                    return;
                }
            }
        } catch (error) {
            console.log('Vercel API endpoint ei toimi:', error);
        }
        
        // Jos ei Vercel endpointia, käytetään localStorage (kehitysympäristö)
        const savedKey = localStorage.getItem('replicate_api_key');
        
        if (savedKey) {
            this.apiKey = savedKey;
            console.log('API key haettu localStorage:sta');
        } else {
            console.log('Ei API key:tä, kysytään käyttäjältä');
            this.promptAPIKey();
        }
    }

    // Lisätään debug-metodi API key:n tarkistamiseen
    debugAPIKey() {
        console.log('API Key status:', {
            hasApiKey: !!this.apiKey,
            apiKeyLength: this.apiKey ? this.apiKey.length : 0,
            apiKeyStart: this.apiKey ? this.apiKey.substring(0, 10) + '...' : 'none'
        });
    }

    promptAPIKey() {
        // Vercelissä ei tarvitse promptata, environment variable hoitaa
        if (typeof process !== 'undefined' && process.env && process.env.REPLICATE_API_TOKEN) {
            this.apiKey = process.env.REPLICATE_API_TOKEN;
            return;
        }
        
        // Kehitysympäristössä promptataan käyttäjältä
        const apiKey = prompt('Syötä Replicate API key:');
        
        if (apiKey && apiKey.trim()) {
            this.apiKey = apiKey.trim();
            localStorage.setItem('replicate_api_key', this.apiKey);
        } else {
            alert('API key on pakollinen!');
            this.promptAPIKey();
        }
    }

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            this.processImageFile(file);
        }
    }

    handleFileDrop(event) {
        const file = event.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            this.processImageFile(file);
        }
    }

    processImageFile(file) {
        if (file.size > 10 * 1024 * 1024) {
            alert('Tiedosto on liian suuri! Maksimikoko: 10MB');
            return;
        }

        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            alert('Tiedostotyyppi ei ole tuettu! Käytä JPG, PNG tai WebP.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.currentImage = file;
            this.showImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
    }

    showImagePreview(dataUrl) {
        const previewImage = document.getElementById('previewImage');
        previewImage.src = dataUrl;
        previewImage.style.display = 'block';
        
        const originalResult = document.getElementById('originalResult');
        originalResult.src = dataUrl;
    }

    async generateImage() {
        // Debug: tarkista API key status
        this.debugAPIKey();
        
        if (!this.currentImage) {
            alert('Lataa ensin kuva!');
            return;
        }

        if (!this.apiKey) {
            this.promptAPIKey();
            if (!this.apiKey) return;
        }

        const processType = document.getElementById('processType').value;
        const isSegmentationOnly = processType === 'segmentation_only';

        this.showStatus('Valmistellaan prosessia...', 'info');
        this.showProgress(0);

        try {
            this.showStatus('Ladataan kuva Replicate:lle...', 'info');
            this.showProgress(10);
            
            const imageUrl = await this.uploadImageToReplicate();
            console.log('Kuva ladattu:', imageUrl);
            
            this.showStatus('Segmentoidaan julkisivu SAM-2:lla...', 'processing');
            this.showProgress(30);
            
            this.segmentationResult = await this.segmentImage(imageUrl);
            console.log('Segmentointi valmis:', this.segmentationResult);
            
            if (isSegmentationOnly) {
                // Pelkkä segmentointi - näytä tulokset
                this.showStatus('Segmentointi valmis! Näytän tulokset.', 'success');
                this.showProgress(100);
                this.showSegmentationResults();
                this.showCostInfo();
                return;
            }
            
            // Täysi prosessi - jatka maalaukseen
            this.showStatus('Maalataan segmentoidut alueet...', 'processing');
            this.showProgress(70);
            
            this.paintingResult = await this.paintSegments(imageUrl, this.segmentationResult);
            console.log('Maalaus valmis:', this.paintingResult);
            
            this.showStatus('Valmis! Kuva on muokattu onnistuneesti.', 'success');
            this.showProgress(100);
            
            this.showResults();
            this.showCostInfo();
            
        } catch (error) {
            console.error('Virhe prosessissa:', error);
            
            let errorMessage = 'Tuntematon virhe';
            if (error.message.includes('API key')) {
                errorMessage = 'Virheellinen API key. Tarkista Replicate API key.';
            } else if (error.message.includes('Upload failed')) {
                errorMessage = 'Kuvan lataus epäonnistui. Tarkista internet-yhteys.';
            } else if (error.message.includes('Prediction failed')) {
                errorMessage = 'AI-mallin prosessi epäonnistui. Kokeile uudelleen.';
            } else if (error.message.includes('SAM-2')) {
                errorMessage = 'SAM-2 segmentointi epäonnistui. Tarkista kuvan laatu ja prompt.';
            } else if (error.message.includes('SDXL')) {
                errorMessage = 'SDXL maalaus epäonnistui. Tarkista segmentointitulokset.';
            } else {
                errorMessage = `Virhe: ${error.message}`;
            }
            
            this.showStatus(errorMessage, 'error');
        }
    }

    async uploadImageToReplicate() {
        if (!this.currentImage) {
            throw new Error('Ei kuvaa ladattuna');
        }

        try {
            // Muunna kuva base64:ksi
            const base64Data = await this.fileToBase64(this.currentImage);
            
            // Lähetä kuva Vercel proxy endpointin kautta
            const response = await fetch('/api/upload-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    imageData: base64Data,
                    fileName: this.currentImage.name || 'house-facade.jpg',
                    contentType: this.currentImage.type || 'image/jpeg'
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Upload failed: ${response.statusText}`);
            }
            
            const result = await response.json();
            return result.uploadUrl;
            
        } catch (error) {
            console.error('Upload error:', error);
            throw new Error(`Kuvan lataus epäonnistui: ${error.message}`);
        }
    }

    // Apumetodi kuvan muuntamiseen base64:ksi
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                // Poista "data:image/jpeg;base64," etuliite
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = error => reject(error);
        });
    }

    async segmentImage(imageUrl) {
        const promptType = document.getElementById('promptType').value;
        const prompt = document.getElementById('segmentationPrompt').value;
        const pointsPerSide = parseInt(document.getElementById('pointsPerSide').value);
        const predIouThresh = parseFloat(document.getElementById('predIouThresh').value);
        const stabilityScoreThresh = parseFloat(document.getElementById('stabilityScoreThresh').value);
        
        // SAM-2 optimoitu input
        const inputData = {
            image: imageUrl,
            prompt_type: promptType, // text, point, tai box
            prompt: prompt,
            points_per_side: pointsPerSide,
            pred_iou_thresh: predIouThresh,
            stability_score_thresh: stabilityScoreThresh
        };

        // Jos käytetään point-tyyppiä, muunna prompt koordinaateiksi
        if (promptType === 'point') {
            // Point-tyyppi: "x,y" koordinaatit
            // Käytetään kuvan keskikohtaa esimerkkinä
            inputData.prompt = "256,256"; // 512x512 kuvan keskikohta
        } else if (promptType === 'box') {
            // Box-tyyppi: "x1,y1,x2,y2" koordinaatit
            // Käytetään kuvan vasenta yläkulmaa esimerkkinä
            inputData.prompt = "0,0,512,512"; // Koko kuva
        }
        // Text-tyyppi käyttää alkuperäisen promptin sellaisenaan

        console.log('SAM-2 segmentointi:', inputData);

        // Käytä SAM-2 mallia
        const prediction = await this.createPrediction(this.SAM2_MODEL, inputData);
        
        // Odota valmistumista
        return await this.waitForCompletion(prediction.id);
    }

    async paintSegments(imageUrl, segments) {
        const selectedModel = document.getElementById('paintingModel').value;
        const prompt = document.getElementById('paintPrompt').value;
        const strength = parseFloat(document.getElementById('strength').value);
        const guidanceScale = parseFloat(document.getElementById('guidanceScale').value);
        const imageSize = document.getElementById('imageSize').value;
        
        // Muunna kuvakoko stringistä numeroiksi
        const [width, height] = imageSize.split('x').map(Number);
        
        console.log('Maalaus parametrit:', { selectedModel, prompt, strength, guidanceScale, width, height });
        console.log('Segmentointitulokset:', segments);
        
        // Valitse mallin ID
        const modelId = this.MODELS[selectedModel];
        
        // Mallikohtaiset parametrit
        let inputData = {
            image: imageUrl,
            mask: segments.output, // SAM-2:n maski
            prompt: prompt,
            negative_prompt: 'blurry, low quality, distorted, unrealistic, artifacts',
            num_inference_steps: 20,
            guidance_scale: guidanceScale,
            strength: strength
        };
        
        // Lisää mallikohtaiset parametrit
        if (selectedModel === 'sdxl') {
            const refineType = document.getElementById('refineType').value;
            const scheduler = document.getElementById('scheduler').value;
            
            inputData = {
                ...inputData,
                width: width,
                height: height,
                refine: refineType,
                scheduler: scheduler,
                seed: Math.floor(Math.random() * 1000000)
            };
        } else if (selectedModel === 'controlnet') {
            const controlnetType = document.getElementById('controlnetType').value;
            const controlnetStrength = parseFloat(document.getElementById('controlnetStrength').value);
            
            inputData = {
                ...inputData,
                controlnet_type: controlnetType,
                controlnet_strength: controlnetStrength,
                width: width,
                height: height
            };
        } else if (selectedModel === 'realistic') {
            const realisticStrength = parseFloat(document.getElementById('realisticStrength').value);
            
            inputData = {
                ...inputData,
                strength: realisticStrength,
                width: width,
                height: height
            };
        } else if (selectedModel === 'sd15') {
            inputData = {
                ...inputData,
                width: 512,
                height: 512
            };
        } else if (selectedModel === 'dreamshaper') {
            inputData = {
                ...inputData,
                width: width,
                height: height
            };
        }

        console.log('Maalaus input:', inputData);

        const prediction = await this.createPrediction(modelId, inputData);
        return await this.waitForCompletion(prediction.id);
    }

    async createPrediction(modelVersion, inputData) {
        const response = await fetch('https://api.replicate.com/v1/predictions', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                version: modelVersion,
                input: inputData
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }

        return await response.json();
    }

    async waitForCompletion(predictionId) {
        while (true) {
            const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
                headers: {
                    'Authorization': `Token ${this.apiKey}`,
                }
            });

            if (!response.ok) {
                throw new Error(`Status check failed: ${response.statusText}`);
            }

            const prediction = await response.json();

            if (prediction.status === 'succeeded') {
                return prediction;
            } else if (prediction.status === 'failed') {
                throw new Error(`Prediction failed: ${prediction.error || 'Unknown error'}`);
            }

            // Odota 2 sekuntia ennen seuraavaa tarkistusta
            await this.delay(2000);
        }
    }

    showStatus(message, type) {
        const statusContainer = document.getElementById('statusContainer');
        const statusMessage = document.getElementById('statusMessage');
        
        statusContainer.style.display = 'block';
        statusMessage.textContent = message;
        statusMessage.className = `status ${type}`;
    }

    showProgress(percentage) {
        const progressFill = document.getElementById('progressFill');
        progressFill.style.width = `${percentage}%`;
    }

    showResults() {
        const resultsSection = document.getElementById('resultsSection');
        const processedResult = document.getElementById('processedResult');
        
        if (this.paintingResult && this.paintingResult.output) {
            // Näytä oikea muokattu kuva
            if (Array.isArray(this.paintingResult.output)) {
                processedResult.src = this.paintingResult.output[0]; // Ensimmäinen tulos
            } else {
                processedResult.src = this.paintingResult.output;
            }
        } else {
            // Fallback jos ei ole tulosta
            processedResult.src = 'https://via.placeholder.com/400x300/ffc107/000000?text=Prosessi+kesken';
        }
        
        resultsSection.style.display = 'grid';
    }

    showCostInfo() {
        const costInfo = document.getElementById('costInfo');
        costInfo.style.display = 'block';
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    showModelParams() {
        const selectedModel = document.getElementById('paintingModel').value;
        
        // Piilota kaikki mallikohtaiset parametrit
        document.querySelectorAll('.model-params').forEach(el => {
            el.style.display = 'none';
        });
        
        // Näytä valitun mallin parametrit
        if (selectedModel === 'sdxl') {
            document.getElementById('sdxlParams').style.display = 'block';
        } else if (selectedModel === 'controlnet') {
            document.getElementById('controlnetParams').style.display = 'block';
        } else if (selectedModel === 'realistic') {
            document.getElementById('realisticParams').style.display = 'block';
        }
        
        // Päivitä kustannustiedot
        this.updateCostInfo(selectedModel);
    }

    updateCostInfo(selectedModel) {
        const costs = {
            sdxl: { segmentation: 0.025, painting: 0.05, total: 0.075 },
            controlnet: { segmentation: 0.025, painting: 0.06, total: 0.085 },
            realistic: { segmentation: 0.025, painting: 0.04, total: 0.065 },
            sd15: { segmentation: 0.025, painting: 0.03, total: 0.055 },
            dreamshaper: { segmentation: 0.025, painting: 0.03, total: 0.055 }
        };
        
        const descriptions = {
            sdxl: 'SDXL on suositeltu yleiskäyttöön. Korkealaatuinen inpainting ja vakaat tulokset.',
            controlnet: 'ControlNet säilyttää tarkasti rakenteen. Ihanteellinen julkisivun maalaukseen.',
            realistic: 'Fotorealistinen ulkoasu. Luonnollinen ja uskottava lopputulos.',
            sd15: 'Nopea ja edullinen. Perustaso, mutta toimii hyvin.',
            dreamshaper: 'Taiteellinen tyyli. Luova ja uniikki ulkoasu.'
        };
        
        const cost = costs[selectedModel];
        const description = descriptions[selectedModel];
        
        if (cost) {
            document.getElementById('segmentationCost').textContent = `~$${cost.segmentation}`;
            document.getElementById('paintingCost').textContent = `~$${cost.painting}`;
            document.getElementById('totalCost').innerHTML = `<strong>~$${cost.total}</strong>`;
        }
        
        if (description) {
            document.getElementById('modelDescription').innerHTML = `<small>${description}</small>`;
        }
    }

    showSegmentationResults() {
        const segmentationResultsSection = document.getElementById('segmentationResultsSection');
        const segmentationResultImage = document.getElementById('segmentationResultImage');
        const originalImage = document.getElementById('originalImage');
        const segmentationPrompt = document.getElementById('segmentationPrompt');
        const promptTypeValue = document.getElementById('promptTypeValue');
        const segmentCount = document.getElementById('segmentCount');
        const confidenceScore = document.getElementById('confidenceScore');

        // Näytä segmentointitulokset
        segmentationResultsSection.style.display = 'block';
        
        // Piilota maalauksen tulokset
        document.getElementById('resultsSection').style.display = 'none';

        // Näytä alkuperäinen kuva
        if (this.currentImage) {
            originalImage.src = this.currentImage;
        }

        // Näytä segmentointitulokset
        if (this.segmentationResult && this.segmentationResult.output) {
            if (Array.isArray(this.segmentationResult.output)) {
                segmentationResultImage.src = this.segmentationResult.output[0];
                segmentCount.textContent = this.segmentationResult.output.length;
            } else {
                segmentationResultImage.src = this.segmentationResult.output;
                segmentCount.textContent = '1';
            }
            
            // Näytä käytetty prompt
            const promptText = document.getElementById('segmentationPrompt').value;
            segmentationPrompt.textContent = `Prompt: ${promptText}`;
            
            // Näytä prompt-tyyppi
            const promptType = document.getElementById('promptType').value;
            promptTypeValue.textContent = promptType;
            
            // Näytä luottamuspisteet jos saatavilla
            if (this.segmentationResult.scores && this.segmentationResult.scores.length > 0) {
                const avgScore = this.segmentationResult.scores.reduce((a, b) => a + b, 0) / this.segmentationResult.scores.length;
                confidenceScore.textContent = `${(avgScore * 100).toFixed(1)}%`;
            } else {
                confidenceScore.textContent = 'Ei saatavilla';
            }
        } else {
            segmentationResultImage.src = 'https://via.placeholder.com/400x300/ffc107/000000?text=Segmentointi+epäonnistui';
            segmentationPrompt.textContent = 'Segmentointi ei onnistunut tai tuloksia ei ole.';
            segmentCount.textContent = '0';
            confidenceScore.textContent = '0%';
        }
    }
}

// Alusta testi kun sivu on ladattu
document.addEventListener('DOMContentLoaded', () => {
    new ReplicateAPITester();
});
