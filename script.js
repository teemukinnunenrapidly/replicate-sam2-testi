// Lisää Replicate client library - CommonJS versio
// import Replicate from "replicate"; // ES6 - ei toimi Vercelissä

class ReplicateAPITester {
    constructor() {
        this.apiKey = '';
        this.currentImage = null;
        this.segmentationResult = null;
        this.paintingResult = null;
        
        // Alusta Replicate client
        this.replicate = null;
        
        // Mallin versiot - Replicate API vaatii tarkan version hashin
        this.SAM2_MODEL = 'meta/sam-2:2c7b381af7ba6b0f71744066c4aba9c6f3b95f02d7bb110d7a0f0b1aaec12329';
        this.MODELS = {
            sdxl: {
                version: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
                name: 'SDXL (Suositeltu - $0.05)',
                description: 'Korkealaatuinen inpainting'
            },
            controlnet: {
                version: 'jagilley/controlnet-sdxl:ad20b5b6a29e0e3c8b58b5c2c0c0c0c0c0c0c0c',
                name: 'ControlNet + SDXL ($0.06)',
                description: 'Tarkka rakenteen säilyttäminen'
            },
            realistic: {
                version: 'stability-ai/realistic-vision:5a7c381af7ba6b0f71744066c4aba9c6f3b95f02d7bb110d7a0f0b1aaec12329',
                name: 'Realistic Vision ($0.04)',
                description: 'Fotorealistinen ulkoasu'
            },
            sd15: {
                version: 'stability-ai/stable-diffusion-2-inpainting:38a5b5b6a29e0e3c8b58b5c2c0c0c0c0c0c0c0c',
                name: 'SD 1.5 Inpainting ($0.03)',
                description: 'Nopea ja edullinen'
            },
            dreamshaper: {
                version: 'cjwbw/dreamshaper:5a7c381af7ba6b0f71744066c4aba9c6f3b95f02d7bb110d7a0f0b1aaec12329',
                name: 'DreamShaper ($0.03)',
                description: 'Taiteellinen tyyli'
            }
        };
        
        this.initializeEventListeners();
        this.loadAPIKey();
    }

    initializeEventListeners() {
        // Kuva upload
        const imageInput = document.getElementById('imageInput');
        if (imageInput) {
            imageInput.addEventListener('change', (e) => this.handleImageUpload(e));
        }

        // Tarkista että elementit ovat olemassa ennen käsittelyä
        const uploadSection = document.getElementById('uploadSection');
        if (uploadSection) {
            // Drag and drop toiminnallisuus
            uploadSection.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadSection.classList.add('dragover');
            });

            uploadSection.addEventListener('dragleave', (e) => {
                e.preventDefault();
                uploadSection.classList.remove('dragover');
            });

            uploadSection.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadSection.classList.remove('dragover');
                this.handleFileDrop(e);
            });
        }

        // Tarkista että elementit ovat olemassa ennen event listenerien lisäämistä
        const strengthSlider = document.getElementById('strength');
        const strengthValue = document.getElementById('strengthValue');
        if (strengthSlider && strengthValue) {
            strengthSlider.addEventListener('input', (e) => {
                strengthValue.textContent = e.target.value;
            });
        }

        const guidanceSlider = document.getElementById('guidanceScale');
        const guidanceValue = document.getElementById('guidanceScaleValue');
        if (guidanceSlider && guidanceValue) {
            guidanceSlider.addEventListener('input', (e) => {
                guidanceValue.textContent = e.target.value;
            });
        }

        const pointsSlider = document.getElementById('pointsPerSide');
        const pointsValue = document.getElementById('pointsPerSideValue');
        if (pointsSlider && pointsValue) {
            pointsSlider.addEventListener('input', (e) => {
                pointsValue.textContent = e.target.value;
            });
        }

        const iouSlider = document.getElementById('predIouThresh');
        const iouValue = document.getElementById('predIouThreshValue');
        if (iouSlider && iouValue) {
            iouSlider.addEventListener('input', (e) => {
                iouValue.textContent = parseFloat(e.target.value).toFixed(2);
            });
        }

        const stabilitySlider = document.getElementById('stabilityScoreThresh');
        const stabilityValue = document.getElementById('stabilityScoreThreshValue');
        if (stabilitySlider && stabilityValue) {
            stabilitySlider.addEventListener('input', (e) => {
                stabilityValue.textContent = parseFloat(e.target.value).toFixed(2);
            });
        }

        const controlnetStrengthSlider = document.getElementById('controlnetStrength');
        const controlnetStrengthValue = document.getElementById('controlnetStrengthValue');
        if (controlnetStrengthSlider && controlnetStrengthValue) {
            controlnetStrengthSlider.addEventListener('input', (e) => {
                controlnetStrengthValue.textContent = parseFloat(e.target.value).toFixed(1);
            });
        }

        const realisticStrengthSlider = document.getElementById('realisticStrength');
        const realisticStrengthValue = document.getElementById('realisticStrengthValue');
        if (realisticStrengthSlider && realisticStrengthValue) {
            realisticStrengthSlider.addEventListener('input', (e) => {
                realisticStrengthValue.textContent = parseFloat(e.target.value).toFixed(1);
            });
        }

        // Generoi-nappi
        const generateBtn = document.getElementById('generateBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateImage());
        }

        // Mallin valinta
        const paintingModel = document.getElementById('paintingModel');
        if (paintingModel) {
            paintingModel.addEventListener('change', () => this.showModelParams());
        }
        
        // Prosessin tyyppi
        const processType = document.getElementById('processType');
        if (processType) {
            processType.addEventListener('change', () => this.updateProcessType());
        }
        
        // Näytä oletusmallin parametrit vain jos elementit ovat olemassa
        if (paintingModel) {
            this.showModelParams();
        }
        if (processType) {
            this.updateProcessType();
        }
    }

    updateProcessType() {
        const processType = document.getElementById('processType');
        const generateBtn = document.getElementById('generateBtn');
        
        if (processType && generateBtn) {
            const processTypeValue = processType.value;
            
            if (processTypeValue === 'segmentation_only') {
                generateBtn.textContent = '🚀 Generoi segmentointi ($0.025)';
                generateBtn.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
            } else {
                generateBtn.textContent = '🚀 Generoi muokattu kuva';
                generateBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            }
        }
    }

    async loadAPIKey() {
        // Hae API key Vercel environment variableista
        try {
            const response = await fetch('/api/get-api-key');
            if (response.ok) {
                const data = await response.json();
                this.apiKey = data.apiKey;
                
                // Väliaikaisesti käytetään HTTP API:a kunnes Replicate client toimii
                // this.replicate = new Replicate({ auth: this.apiKey });
                
                console.log('API key haettu Vercel endpointista');
                console.log('API Key status:', {
                    apiKeyLength: this.apiKey ? this.apiKey.length : 0,
                    apiKeyStart: this.apiKey ? this.apiKey.substring(0, 10) + '...' : 'none',
                    replicateClient: 'HTTP API (väliaikainen)'
                });
            } else {
                throw new Error(`API key fetch failed: ${response.status}`);
            }
        } catch (error) {
            console.error('API key loading error:', error);
            this.showAPIKeyError();
        }
    }

    // Näytä virheviesti API key:n puuttumisesta
    showAPIKeyError() {
        const errorMessage = 'API key ei ole saatavilla! Tarkista että Vercel integration on toiminnassa.';
        console.error(errorMessage);
        
        // Näytä virheviesti käyttöliittymässä
        const statusContainer = document.getElementById('statusContainer');
        const statusMessage = document.getElementById('statusMessage');
        
        if (statusContainer && statusMessage) {
            statusContainer.style.display = 'block';
            statusMessage.textContent = errorMessage;
            statusMessage.className = 'status error';
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
        const imagePreview = document.getElementById('imagePreview');
        if (imagePreview) {
            imagePreview.innerHTML = `
                <div class="preview-container">
                    <h4>📸 Ladattu Kuva:</h4>
                    <img src="${dataUrl}" alt="Esikatselu" style="max-width: 100%; max-height: 300px; border-radius: 8px;">
                    <p><strong>Tiedosto:</strong> ${this.currentImage.name}</p>
                    <p><strong>Koko:</strong> ${(this.currentImage.size / 1024 / 1024).toFixed(2)} MB</p>
                    <p><strong>Tyyppi:</strong> ${this.currentImage.type}</p>
                </div>
            `;
        }
        
        const originalResult = document.getElementById('originalResult');
        if (originalResult) {
            originalResult.src = dataUrl;
        }
    }

    async generateImage() {
        // Debug: tarkista API key status
        this.debugAPIKey();
        
        if (!this.currentImage) {
            alert('Lataa ensin kuva!');
            return;
        }

        if (!this.apiKey) {
            this.showAPIKeyError();
            return;
        }

        const processType = document.getElementById('processType');
        const isSegmentationOnly = processType && processType.value === 'segmentation_only';

        if (processType) {
            if (isSegmentationOnly) {
                processType.value = 'segmentation_only'; // Ensure it's set to segmentation_only
            } else {
                processType.value = 'painting'; // Ensure it's set to painting
            }
        }

        this.showStatus('Valmistellaan prosessia...', 'info');
        this.showProgress(0);

        try {
            this.showStatus('Ladataan kuva Replicate:lle...', 'info');
            this.showProgress(10);
            
            const imageUrl = await this.uploadImageToReplicate();
            console.log('Kuva ladattu:', imageUrl);
            
            this.showStatus('Segmentoidaan julkisivu SAM-2:lla...', 'processing');
            this.showProgress(30);
            
            this.segmentationResult = await this.segmentImage();
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
            
            this.paintingResult = await this.paintSegments(this.segmentationResult);
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
            console.log('Starting image upload to Replicate...');
            console.log('Image details:', {
                name: this.currentImage.name,
                size: this.currentImage.size,
                type: this.currentImage.type
            });
            
            // Muunna kuva base64:ksi
            const base64Data = await this.fileToBase64(this.currentImage);
            console.log('Image converted to base64, length:', base64Data.length);
            
            // Lähetä kuva Vercel proxy endpointin kautta
            console.log('Sending request to /api/upload...');
            const response = await fetch('/api/upload', {
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
            
            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Upload failed with status:', response.status, errorData);
                throw new Error(errorData.error || `Upload failed: ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log('Upload successful:', result);
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

    async segmentImage() {
        try {
            console.log('Aloitetaan kuvan segmentointi...');
            
            // Tarkista että API key on saatavilla
            if (!this.apiKey) {
                throw new Error('API key ei ole saatavilla. Tarkista Vercel environment variables.');
            }
            
            // Hae kuva Replicate:lle ja saa upload URL
            const imageUrl = await this.uploadImageToReplicate();
            console.log('Image uploaded to Replicate, URL:', imageUrl);
            
            // SAM-2 segmentointi käyttäen HTTP API:a (väliaikainen)
            const response = await fetch('https://api.replicate.com/v1/predictions', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    version: this.SAM2_MODEL,
                    input: {
                        image: imageUrl,  // Käytä Replicate upload URL:ia
                        prompt_type: document.getElementById('promptType')?.value || 'text',
                        points_per_side: parseInt(document.getElementById('pointsPerSide')?.value) || 32,
                        pred_iou_thresh: parseFloat(document.getElementById('predIouThresh')?.value) || 0.88,
                        stability_score_thresh: parseFloat(document.getElementById('stabilityScoreThresh')?.value) || 0.95
                    }
                })
            });
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.statusText}`);
            }
            
            const prediction = await response.json();
            console.log('SAM-2 prediction created:', prediction);
            
            // Odota valmistumista
            return await this.waitForCompletion(prediction.id);
        } catch (error) {
            console.error('Segmentointi epäonnistui:', error);
            throw new Error(`Segmentointi epäonnistui: ${error.message}`);
        }
    }

    async waitForCompletion(predictionId) {
        console.log(`Waiting for prediction ${predictionId} to complete...`);
        let attempts = 0;
        const maxAttempts = 100; // Max 100 attempts
        const interval = 5000; // 5 seconds

        while (attempts < maxAttempts) {
            const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${this.apiKey}`
                }
            });

            if (!response.ok) {
                throw new Error(`Prediction status check failed: ${response.statusText}`);
            }

            const prediction = await response.json();
            console.log(`Prediction status: ${prediction.status}, attempts: ${attempts + 1}`);

            if (prediction.status === 'succeeded') {
                console.log('Prediction succeeded:', prediction);
                return prediction;
            } else if (prediction.status === 'failed') {
                console.error('Prediction failed:', prediction);
                throw new Error(`Prediction failed: ${prediction.error}`);
            } else if (prediction.status === 'canceled') {
                console.error('Prediction canceled:', prediction);
                throw new Error('Prediction was canceled.');
            }
            attempts++;
            await this.delay(interval);
        }
        throw new Error(`Prediction ${predictionId} did not complete within ${maxAttempts * interval / 1000} seconds.`);
    }

    async paintSegments(segments) {
        try {
            console.log('Aloitetaan segmenttien maalaus...');
            
            // Hae kuva Replicate:lle ja saa upload URL
            const imageUrl = await this.uploadImageToReplicate();
            console.log('Image uploaded to Replicate, URL:', imageUrl);
            
            // Valitse malli ja parametrit
            const paintingModel = document.getElementById('paintingModel');
            const modelId = paintingModel ? paintingModel.value : null; // Get the selected model from the UI
            
            if (!modelId) {
                throw new Error('Ei mallia valittu.');
            }

            const model = this.MODELS[modelId];
            
            if (!model) {
                throw new Error(`Tuntematon malli: ${modelId}`);
            }
            
            // Muodosta input data mallin mukaan
            const inputData = {
                image: imageUrl,  // Käytä Replicate upload URL:ia
                mask: segments,  // Segmentointitulokset
                prompt: document.getElementById('paintPrompt')?.value || 'house painting',
                strength: parseFloat(document.getElementById('strength')?.value) || 0.8,
                guidance_scale: parseFloat(document.getElementById('guidanceScale')?.value) || 7.5,
                num_inference_steps: 20
            };
            
            // Lisää mallikohtaiset parametrit
            if (modelId === 'sdxl') {
                const scheduler = document.getElementById('scheduler');
                const refineType = document.getElementById('refineType');
                if (scheduler && refineType) {
                    inputData.scheduler = scheduler.value; // Get scheduler from UI
                    inputData.refine = refineType.value; // Get refine type from UI
                }
            } else if (modelId === 'controlnet') {
                const controlnetType = document.getElementById('controlnetType');
                const controlnetStrength = document.getElementById('controlnetStrength');
                if (controlnetType && controlnetStrength) {
                    inputData.control_type = controlnetType.value; // Get controlnet type from UI
                    inputData.control_strength = parseFloat(controlnetStrength.value); // Get controlnet strength from UI
                }
            } else if (modelId === 'realistic') {
                const realisticStrength = document.getElementById('realisticStrength');
                if (realisticStrength) {
                    inputData.realism_strength = parseFloat(realisticStrength.value); // Get realistic strength from UI
                }
            }
            
            console.log('Maalaus input:', inputData);
            
            // Luo prediction käyttäen HTTP API:a (väliaikainen)
            const response = await fetch('https://api.replicate.com/v1/predictions', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    version: model.version,
                    input: inputData
                })
            });
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.statusText}`);
            }
            
            const prediction = await response.json();
            console.log('Paint prediction created:', prediction);
            
            // Odota valmistumista
            return await this.waitForCompletion(prediction.id);
        } catch (error) {
            console.error('Maalaus epäonnistui:', error);
            throw new Error(`Maalaus epäonnistui: ${error.message}`);
        }
    }

    showStatus(message, type) {
        const statusContainer = document.getElementById('statusContainer');
        const statusMessage = document.getElementById('statusMessage');
        
        if (statusContainer && statusMessage) {
            statusContainer.style.display = 'block';
            statusMessage.textContent = message;
            statusMessage.className = `status ${type}`;
        }
    }

    showProgress(percentage) {
        const progressFill = document.getElementById('progressFill');
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
    }

    showResults() {
        const resultsSection = document.getElementById('resultsSection');
        const processedResult = document.getElementById('processedResult');
        
        if (resultsSection && processedResult) {
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
    }

    showCostInfo() {
        const costInfo = document.getElementById('costInfo');
        if (costInfo) {
            costInfo.style.display = 'block';
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    showModelParams() {
        const paintingModel = document.getElementById('paintingModel');
        
        // Piilota kaikki mallikohtaiset parametrit
        document.querySelectorAll('.model-params').forEach(el => {
            el.style.display = 'none';
        });
        
        // Näytä valitun mallin parametrit
        if (paintingModel) {
            const selectedModel = paintingModel.value;
            if (selectedModel === 'sdxl') {
                const sdxlParams = document.getElementById('sdxlParams');
                if (sdxlParams) {
                    sdxlParams.style.display = 'block';
                }
            } else if (selectedModel === 'controlnet') {
                const controlnetParams = document.getElementById('controlnetParams');
                if (controlnetParams) {
                    controlnetParams.style.display = 'block';
                }
            } else if (selectedModel === 'realistic') {
                const realisticParams = document.getElementById('realisticParams');
                if (realisticParams) {
                    realisticParams.style.display = 'block';
                }
            }
        }
        
        // Päivitä kustannustiedot
        this.updateCostInfo();
    }

    updateCostInfo() {
        const paintingModel = document.getElementById('paintingModel');
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
        
        if (paintingModel) {
            const selectedModel = paintingModel.value;
            const cost = costs[selectedModel];
            const description = descriptions[selectedModel];
            
            const segmentationCost = document.getElementById('segmentationCost');
            const paintingCost = document.getElementById('paintingCost');
            const totalCost = document.getElementById('totalCost');
            const modelDescription = document.getElementById('modelDescription');

            if (segmentationCost) segmentationCost.textContent = `~$${cost.segmentation}`;
            if (paintingCost) paintingCost.textContent = `~$${cost.painting}`;
            if (totalCost) totalCost.innerHTML = `<strong>~$${cost.total}</strong>`;
            if (modelDescription) modelDescription.innerHTML = `<small>${description}</small>`;
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
        if (segmentationResultsSection) {
            segmentationResultsSection.style.display = 'block';
        }
        
        // Piilota maalauksen tulokset
        const resultsSection = document.getElementById('resultsSection');
        if (resultsSection) {
            resultsSection.style.display = 'none';
        }

        // Näytä alkuperäinen kuva
        if (this.currentImage) {
            const originalImageElement = document.getElementById('originalImage');
            if (originalImageElement) {
                originalImageElement.src = this.currentImage;
            }
        }

        // Näytä segmentointitulokset
        if (this.segmentationResult && this.segmentationResult.output) {
            if (segmentationResultImage) {
                if (Array.isArray(this.segmentationResult.output)) {
                    segmentationResultImage.src = this.segmentationResult.output[0];
                    segmentCount.textContent = this.segmentationResult.output.length;
                } else {
                    segmentationResultImage.src = this.segmentationResult.output;
                    segmentCount.textContent = '1';
                }
            }
            
            // Näytä käytetty prompt
            const segmentationPromptElement = document.getElementById('segmentationPrompt');
            if (segmentationPromptElement) {
                const promptText = segmentationPromptElement.value;
                segmentationPromptElement.textContent = `Prompt: ${promptText}`;
            }
            
            // Näytä prompt-tyyppi
            const promptType = document.getElementById('promptType');
            const promptTypeValueElement = document.getElementById('promptTypeValue');
            if (promptType && promptTypeValueElement) {
                const promptTypeValue = promptType.value;
                promptTypeValueElement.textContent = promptTypeValue;
            }
            
            // Näytä luottamuspisteet jos saatavilla
            if (this.segmentationResult.scores && this.segmentationResult.scores.length > 0) {
                const avgScore = this.segmentationResult.scores.reduce((a, b) => a + b, 0) / this.segmentationResult.scores.length;
                confidenceScore.textContent = `${(avgScore * 100).toFixed(1)}%`;
            } else {
                confidenceScore.textContent = 'Ei saatavilla';
            }
        } else {
            if (segmentationResultImage) {
                segmentationResultImage.src = 'https://via.placeholder.com/400x300/ffc107/000000?text=Segmentointi+epäonnistui';
            }
            if (segmentationPrompt) {
                segmentationPrompt.textContent = 'Segmentointi ei onnistunut tai tuloksia ei ole.';
            }
            if (segmentCount) {
                segmentCount.textContent = '0';
            }
            if (confidenceScore) {
                confidenceScore.textContent = '0%';
            }
        }
    }
}

// Alusta testi kun sivu on ladattu
document.addEventListener('DOMContentLoaded', () => {
    new ReplicateAPITester();
});
