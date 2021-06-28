<template>
    <div id="app">
        <h1 class="mb-4 mt-2 alert-success">SecodApp - POC</h1>
		<b-row>			
			<div class="container padding-left">
				<h2>Antes de iniciar, nombra tu sesion</h2>				
				<div>
					<b-input v-model="palabra" placeholder="Nombre"></b-input>
				</div>
				<div class="margin-top">
					<b-button-group>
						<b-button  class="padding-right-2" variant="success" type="submit"  :disabled="!palabra" @click.prevent="hide += 1">Crear Sesion</b-button>
						<b-button class="padding-left-2" @click.prevent="hide = 0" variant="danger">Cerrar Sesion</b-button>
					</b-button-group>
				</div>
			</div>
		</b-row>
		<div v-show="hide == 1 ">		
			<b-row>
				<b-col>
					<b-form-group>
						<b-form-file
								:state="Boolean(file)"
								@change="setImage"
								accept="image/*"
								class="col-sm-6 mt-2"
								drop-placeholder="Arrastra tu imagen aqui"
								placeholder="Selecciona la imagen a cargar..."
								size="lg"
								v-model="file"
						></b-form-file>
						<div class="mt-3">Selected file: {{ file ? file.name : '' }}</div>
					</b-form-group>
				</b-col>
			</b-row>
			<div>
				<b-img :src="resultImage" alt="Responsive image" fluid v-show="showResult"></b-img>
				<div v-show="showResult">
					<b-link :href="resultImage" download="result.png">Download Image</b-link>
				</div>
			</div>
			<div>
				<polygonCrop :canvasClass="'some-class'"
					:height="600"
					:imageSource="imgSrc"
					:showCanvas="show"
					:showPointer="showPointer"
					:width="800"
					ref="canvas"
				>
				</polygonCrop>
				<b-button @click.prevent="crop" variant="success">Cortar</b-button>
				<!--    <b-button @click.prevent="undo" variant="warning">Deshacer</b-button>
				<b-button @click.prevent="redo" variant="primary">Rehacer</b-button>
				<b-button @click.prevent="reset" variant="danger">Reinicar</b-button> -->
				<b-button @click.prevent="clear" variant="danger">Limpiar</b-button> 
			</div>
			<div>
				<!--
				<div :key="index" v-for="(punto, index) in puntos">
					<b-table striped hover :items="punto['poligono']['normal']">
						<b-button @click.prevent="punto['poligono']['normal']" variant="success">Ver</b-button>
					</b-table>
					
				</div> -->
				<!--
				<div :key="index" v-for="(punto, index) in puntos">
					<b-table striped hover :items="punto['poligono']['fijo']">
						<b-button @click.prevent="punto['poligono']['fijo']" variant="success">Ver</b-button>
					</b-table>
				</div> -->

				<b-table striped hover :items="puntos" :fields="tableConf">
					<template #cell(index)="data">
						{{ data.index + 1 }}
					</template>
					<template #cell(acciones)="row">
						<!-- <b-button size="sm" @click="info(row.item, row.index, $event.target)" class="mr-1">
						Info modal
						</b-button> -->
						<b-button variant="success" @click="test({ id: row.index + 1, item: row.item })">Guardar</b-button>				
					</template>
				</b-table>		
			</div>
		</div>
    </div>
</template>
<script>
	// import polygonCrop from '../../dist/PolygonCropper.umd';
	import polygonCrop from 'vue-polygon-cropper';
	import {getFirebaseInstance} from './firebase';

	const db = getFirebaseInstance();

	export default {
		name: 'App',
		data() {
			return {
				imgSrc: '/demo.png',
				hide : 0,
				file: null,
				show: false,
				showResult: false,
				showPointer: true,
				resultImage: "",
				puntos: [],
				tableConf:[
					'index',
					'nombre', 
					{ 
						key: 'poligono',
						label: 'Puntos' , 
						formatter: punto => 
						{
							return punto['normal']
						} 
					},
					'acciones',
				],
				palabra: "",
			};
		},
		components: {
			polygonCrop
		},
		methods: {
			setImage(e) {
				console.log(this.$refs.canvas);
				const file = e.target.files[0];
				if (!file && file.type.indexOf('image/') === -1) {
					alert('Please select an image file');
					return;
				}
				if (typeof FileReader === 'function') {
					const reader = new FileReader();
					reader.onload = (event) => {
						this.imgSrc = event.target.result;
						this.show = true;
					};
					reader.readAsDataURL(file);
				} else {
					alert('Sorry, FileReader API not supported');
				}
			},
			ver: function (punto) {
				console.log(punto['poligono']['fijo']);
				this.$refs.canvas.currentMarks = punto['poligono']['fijo'];
				this.$refs.canvas.crop();
				this.resultImage = this.$refs.canvas.resultImage;
				this.show = false;
				this.showResult = true;
			},
			crop: function () {
				console.log(this.$refs.canvas.currentMarks);
				let marks = this.$refs.canvas.currentMarks;
				let chunked = []
				let processed = []
				let size = 2;
				for (let i = 0;  i < marks.length; i += size) {
				chunked.push(marks.slice(i, i + size))
				processed.push({'punto': marks.slice(i, i + size)})
				}
				this.puntos.push({'poligono': {
					'procesado': processed,
					'normal': chunked,
					'fijo': marks,
				}});
				console.log(chunked);
				this.show = true;
				this.showResult = false;
				this.$refs.canvas.reset();
			},
			undo: function () {
				this.$refs.canvas.undo();
			},
			clear: function() {
			this.puntos = [];
			},
			redo: function () {
				this.$refs.canvas.redo();
			},
			reset: function () {
				this.show = true;
				this.showResult = false;
				this.$refs.canvas.reset();
			},
			test:function(id){
				console.log(this.palabra);
				console.log(id.id);
				console.log(id.item.poligono.normal);
				
				let coordinates = {
					numtrazo: id.id, 	
					coordenadas: id.item.poligono.normal.map( punto => JSON.stringify(punto))
				}
																//set(this.poligonoName)
				db.collection('Sesiones').doc(this.palabra).collection('poligonos').add(coordinates)
				alert("Guardado en la base de datos con exito")
			}
	
		}
	};
</script>

<style>
    #app {
        font-family: Avenir, Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        margin-top: 60px;
    }

    .some-class {
        border: 1px solid #2c3e50;
    }
</style>
