{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    ags = {
      url = "github:aylur/ags";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = {
    nixpkgs,
    ags,
    ...
  }: let
    system = "x86_64-linux";
    pkgs = import nixpkgs {inherit system;};

    pname = "ags-shell";

    extraPackages = with ags.packages.${system}; [
      pkgs.libadwaita
      astal4
      battery
      tray
      wireplumber
      hyprland
      apps
      notifd
    ];
  in {
    packages.${system}.default = pkgs.stdenv.mkDerivation {
      name = pname;
      src = ./.;

      nativeBuildInputs = with pkgs; [
        wrapGAppsHook
        gobject-introspection
        ags.packages.${system}.default
      ];

      buildInputs = extraPackages;

      installPhase = ''
        runHook preInstall

        mkdir -p $out/bin $out/share
        cp -r * $out/share
        ags bundle app.ts $out/bin/${pname} -d "SRC='$out/share'"

        runHook postInstall
      '';
    };

    devShells.${system}.default = pkgs.mkShell {
      buildInputs = [
        (ags.packages.${system}.default.override {
          inherit extraPackages;
        })
      ];
    };
  };
}
