import {
  Component,
  signal,
  inject,
  OnInit,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Personalizados } from './services/personalizados';
import { Anime, Design, SacoColor } from './models/personalizados.model';

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  private personalizadosService = inject(Personalizados);
  private route = inject(ActivatedRoute);

  // Estado de la aplicación
  protected animes = signal<Anime[]>([]);
  protected designs = signal<Design[]>([]);
  protected selectedAnime = signal<string | null>(null);
  protected selectedFrontal = signal<Design | null>(null);
  protected selectedPosterior = signal<Design | null>(null);
  protected vista = signal<'frontal' | 'posterior'>('posterior');
  protected loading = signal(false);

  // Colores predefinidos del saco
  protected readonly colores: SacoColor[] = [
    { name: 'Negro', value: 'negro', hex: '#1a1a1a' },
    { name: 'Blanco', value: 'blanco', hex: '#f5f5f5' },
    { name: 'Azul', value: 'azul', hex: '#1e3a8a' },
    { name: 'Verde', value: 'verde', hex: '#064e3b' },
    { name: 'Gris', value: 'gris', hex: '#6b7280' },
    { name: 'Rosa', value: 'rosa', hex: '#ec4899' },
    { name: 'Beige', value: 'beige', hex: '#d4a574' },
  ];

  protected selectedColor = signal<SacoColor>(this.colores[0]);

  // Computed para URLs de imágenes del hoddie según color y vista
  protected hoddieImageUrl = computed(() => {
    const color = this.selectedColor().value;
    const vista = this.vista() === 'frontal' ? 'frente' : 'posterior';
    return `/assets/hoddies/${color}/${vista}.png`;
  });

  // Computed para el diseño actual según la vista
  protected currentDesign = computed(() =>
    this.vista() === 'frontal' ? this.selectedFrontal() : this.selectedPosterior(),
  );

  get otraVista() {
    return this.vista() === 'frontal' ? 'de atrás' : 'de al frente';
  }

  ngOnInit() {
    this.loadAnimes();
    this.loadFromUrl();
  }

  // Cargar animes disponibles
  loadAnimes() {
    this.loading.set(true);
    this.personalizadosService.getAnimes().subscribe({
      next: (response) => {
        this.animes.set(response.data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar animes:', error);
        this.loading.set(false);
      },
    });
  }

  // Cargar diseños de un anime
  selectAnime(anime: Anime) {
    this.selectedAnime.set(anime.id);
    this.loadDesigns(anime.id);
  }

  // Manejar cambio de select
  onAnimeChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const animeId = select.value;

    if (!animeId) {
      this.selectedAnime.set(null);
      this.designs.set([]);
      this.selectedFrontal.set(null);
      this.selectedPosterior.set(null);
      return;
    }

    this.selectedAnime.set(animeId);
    this.selectedFrontal.set(null);
    this.selectedPosterior.set(null);
    this.loadDesigns(animeId);
  }

  // Cargar diseños
  private loadDesigns(animeId: string) {
    this.loading.set(true);
    this.personalizadosService.getDesigns(animeId).subscribe({
      next: (response) => {
        this.designs.set(response.data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar diseños:', error);
        this.loading.set(false);
      },
    });
  }

  // Seleccionar diseño frontal
  selectFrontal(design: Design) {
    // Si es el mismo diseño, deseleccionar
    if (this.selectedFrontal() && this.selectedFrontal()!.id === design.id) {
      this.selectedFrontal.set(null);
      this.updateUrl();
      return;
    }
    this.selectedFrontal.set(design);
    this.updateUrl();
    this.cambiarVista('frontal');
  }

  // Seleccionar diseño posterior
  selectPosterior(design: Design) {
    // Si es el mismo diseño, deseleccionar
    if (this.selectedPosterior() && this.selectedPosterior()!.id === design.id) {
      this.selectedPosterior.set(null);
      this.updateUrl();
      return;
    }
    this.selectedPosterior.set(design);
    this.updateUrl();
    this.cambiarVista('posterior');
  }

  // Cambiar color del saco
  selectColor(color: SacoColor) {
    this.selectedColor.set(color);
    this.updateUrl();
  }

  // Cambiar vista (frontal/posterior)
  cambiarVista(vista: 'frontal' | 'posterior') {
    this.vista.set(vista);
  }

  // Obtener URL de imagen
  getImageUrl(filename: string): string {
    const anime = this.selectedAnime();
    if (!anime) return '';
    return this.personalizadosService.getImageUrl(anime, filename);
  }

  // Actualizar URL con los parámetros seleccionados
  updateUrl() {
    const params = new URLSearchParams();
    const anime = this.selectedAnime();
    const frontal = this.selectedFrontal();
    const posterior = this.selectedPosterior();
    const color = this.selectedColor();

    if (anime) params.set('anime', anime);
    if (frontal) params.set('pecho', frontal.filename);
    if (posterior) params.set('espalda', posterior.filename);
    if (color) params.set('color', color.value);

    const url = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', url);
  }

  // Cargar configuración desde URL
  loadFromUrl() {
    this.route.queryParams.subscribe((params) => {
      const anime = params['anime'];
      const pecho = params['pecho'];
      const espalda = params['espalda'];
      const colorValue = params['color'];

      // Cargar color
      if (colorValue) {
        const color = this.colores.find((c) => c.value === colorValue);
        if (color) this.selectedColor.set(color);
      }

      if (anime) {
        // Simular selección de anime
        this.selectedAnime.set(anime);
        this.personalizadosService.getDesigns(anime).subscribe({
          next: (response) => {
            this.designs.set(response.data);
            // Cargar diseños seleccionados
            if (pecho) {
              const frontalDesign = response.data.find((d) => d.filename === pecho);
              if (frontalDesign) this.selectedFrontal.set(frontalDesign);
            }
            if (espalda) {
              const posteriorDesign = response.data.find((d) => d.filename === espalda);
              if (posteriorDesign) this.selectedPosterior.set(posteriorDesign);
            }
          },
        });
      }
    });
  }

  // Compartir configuración
  compartir() {
    const actualUrl = window.location.href;
    let url =
      'https://api.whatsapp.com/send?phone=573163201115&text=Holaa%20%F0%9F%91%8B%F0%9F%91%8B.%20Estoy%20interesado%20en%20este%20saco%20personalizado%20';
    url += encodeURIComponent(actualUrl);
    window.open(url, '_blank');
  }
}
